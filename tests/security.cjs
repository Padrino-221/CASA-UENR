/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: (id) => {
    if (id in mocks) return mocks[id];
    if (id === '@/lib/media-image') return load('src/lib/media-image.ts');
    if (id === '@/lib/roles') return load('src/lib/roles.ts');
    return require(id);
  }, console, URL, Request, Response, File, Buffer, Uint8Array, process });
  return exports;
}
const response = { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } };
const session = (role, extra = {}) => ({ user: { id: 'operator', role, chapterId: 'chapter-a', regionId: 'region-a', ...extra } });
function route(file, role, db, extra = {}) {
  return load(`src/app/api/${file}/route.ts`, { 'next/server': response, '@/auth': { auth: async () => role ? session(role) : null }, '@/lib/prisma': { db }, ...extra });
}

test('regional admin cannot promote a local admin to national admin', async () => {
  let updated = false;
  const api = route('users/[id]', 'REGIONAL_ADMIN', { user: { findUnique: async () => ({ role: 'LOCAL_ADMIN', chapterId: 'chapter-a', regionId: null }), update: async () => { updated = true; } }, chapter: { findUnique: async () => ({ regionId: 'region-a' }) } });
  const result = await api.PATCH(new Request('http://local', { method: 'PATCH', body: JSON.stringify({ role: 'NATIONAL_ADMIN' }) }), { params: Promise.resolve({ id: 'target' }) });
  assert.equal(result.status, 403); assert.equal(updated, false);
});
test('diagnostics deny unauthenticated callers without touching the database', async () => {
  const api = route('diag', null, {});
  assert.equal((await api.GET()).status, 403);
});
test('member edits cannot change chapter assignment', async () => {
  const api = route('students/[id]', 'SECRETARY', { student: { findUnique: async () => ({ chapterId: 'chapter-a' }) } });
  const result = await api.PATCH(new Request('http://local', { method: 'PATCH', body: JSON.stringify({ chapterId: 'chapter-b' }) }), { params: Promise.resolve({ id: 'student' }) });
  assert.equal(result.status, 400);
});
test('attendance rejects students outside the session chapter', async () => {
  const api = route('attendance/mark', 'SECRETARY', { attendanceSession: { findUnique: async () => ({ chapterId: 'chapter-a' }) }, student: { count: async () => 0 } });
  const result = await api.POST(new Request('http://local', { method: 'POST', body: JSON.stringify({ sessionId: 'session', studentIds: ['foreign-student'] }) }));
  assert.equal(result.status, 403);
});
test('attendance reads enforce the caller chapter even with a foreign session id', async () => {
  let where;
  const api = route('attendance/mark', 'FINANCE', { attendanceRecord: { findMany: async (args) => { where = args.where; return []; } } });
  await api.GET(new Request('http://local?sessionId=foreign-session'));
  assert.equal(where.session.chapterId, 'chapter-a');
});
for (const role of ['FINANCE', 'SECRETARY']) {
  test(`${role} report queries retain chapter restrictions`, async () => {
    const queries = [];
    const api = route('reports', role, {
      transaction: { groupBy: async (args) => { queries.push(args.where); return []; }, findMany: async (args) => { queries.push(args.where); return []; } },
      chapter: { findMany: async (args) => { assert.equal(args.where.AND[0].id, 'chapter-a'); return []; } },
      attendanceSession: { findMany: async (args) => { queries.push(args.where); return []; } },
    });
    const result = await api.GET(new Request('http://local?range=all'));
    assert.equal(result.status, 200);
    assert.equal(queries.length, 3);
    queries.forEach((where) => assert.equal(where.AND[0].chapterId, 'chapter-a'));
  });
}
test('CMS role cannot read administrative reports', async () => {
  assert.equal((await route('reports', 'CONTENT_MANAGER', {}).GET(new Request('http://local'))).status, 403);
});


test('local admin creates content managers in their own chapter and region', async () => {
  let created;
  const api = route('users', 'LOCAL_ADMIN', {
    chapter: { findUnique: async () => ({ regionId: 'region-a' }) },
    user: { findUnique: async () => null, create: async ({ data }) => { created = data; return { ...data, id: 'new-editor' }; } },
  }, { bcryptjs: { hash: async () => 'hashed-password' } });
  const result = await api.POST(new Request('http://local', { method: 'POST', body: JSON.stringify({ name: 'Chapter editor', email: 'editor@example.test', role: 'CONTENT_MANAGER', chapterId: 'foreign-chapter', regionId: 'foreign-region' }) }));
  assert.equal(result.status, 201);
  assert.equal(created.chapterId, 'chapter-a');
  assert.equal(created.regionId, 'region-a');
  assert.equal(result.body.password, undefined);
});

test('local admin cannot manage another chapter content manager', async () => {
  const api = route('users/[id]', 'LOCAL_ADMIN', { user: { findUnique: async () => ({ role: 'CONTENT_MANAGER', chapterId: 'chapter-b' }) } });
  const params = { params: Promise.resolve({ id: 'foreign-editor' }) };
  assert.equal((await api.PATCH(new Request('http://local', { method: 'PATCH', body: JSON.stringify({ name: 'Changed' }) }), params)).status, 403);
  assert.equal((await api.DELETE(new Request('http://local', { method: 'DELETE' }), params)).status, 403);
});

test('local admin can edit own content manager but cannot promote to national admin', async () => {
  let data;
  const api = route('users/[id]', 'LOCAL_ADMIN', { user: {
    findUnique: async () => ({ role: 'CONTENT_MANAGER', chapterId: 'chapter-a' }),
    update: async (args) => { data = args.data; return args.data; },
  } });
  const params = { params: Promise.resolve({ id: 'own-editor' }) };
  const allowed = await api.PATCH(new Request('http://local', { method: 'PATCH', body: JSON.stringify({ name: 'Editor', role: 'CONTENT_MANAGER', chapterId: 'foreign-chapter' }) }), params);
  assert.equal(allowed.status, 200);
  assert.equal(data.chapterId, 'chapter-a');
  const denied = await api.PATCH(new Request('http://local', { method: 'PATCH', body: JSON.stringify({ role: 'NATIONAL_ADMIN' }) }), params);
  assert.equal(denied.status, 403);
});

test('content managers cannot create admin accounts', async () => {
  const api = route('users', 'CONTENT_MANAGER', {});
  const result = await api.POST(new Request('http://local', { method: 'POST', body: JSON.stringify({ name: 'Admin', email: 'admin@example.test', role: 'NATIONAL_ADMIN' }) }));
  assert.equal(result.status, 403);
});


test('CMS uploads survive object storage failure and return a usable database media URL', async () => {
  let saved;
  const api = route('content/upload', 'CONTENT_MANAGER', { mediaAsset: { create: async ({ data }) => { saved = data; return { ...data, createdAt: new Date() }; } } }, {
    '@/lib/cms/auth': { getContentSession: async () => session('CONTENT_MANAGER') },
    '@/lib/storage': { isStorageConfigured: () => true, uploadObject: async () => { throw new Error('Storage unavailable'); } },
  });
  const form = new FormData();
  form.append('file', new File([Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')], 'test.gif', { type: 'image/gif' }));
  const result = await api.POST(new Request('http://local', { method: 'POST', body: form }));
  assert.equal(result.status, 201);
  assert.equal(result.body.url, `/api/media/${saved.id}`);
  assert.equal(saved.mimeType, 'image/webp');
  assert.ok(saved.data.length > 0);
  const media = route('media/[id]', null, { mediaAsset: { findUnique: async () => saved } });
  const response = await media.GET(new Request('http://local'), { params: Promise.resolve({ id: saved.id }) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'image/webp');
  assert.equal(Buffer.from(await response.arrayBuffer()).toString('ascii', 0, 4), 'RIFF');
});

test('CMS uploads retain readable image bytes even when object storage succeeds', async () => {
  let saved;
  const api = route('content/upload', 'CONTENT_MANAGER', { mediaAsset: { create: async ({ data }) => { saved = data; return data; } } }, {
    '@/lib/cms/auth': { getContentSession: async () => session('CONTENT_MANAGER') },
    '@/lib/storage': { isStorageConfigured: () => true, uploadObject: async () => 'https://private-storage.example/test.gif' },
  });
  const form = new FormData(); form.append('file', new File([Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')], 'test.gif', { type: 'image/gif' }));
  const result = await api.POST(new Request('http://local', { method: 'POST', body: form }));
  assert.equal(result.status, 201);
  assert.equal(result.body.url, `/api/media/${saved.id}`);
  assert.equal(saved.mimeType, 'image/webp');
  assert.ok(saved.data.length > 0);
  assert.ok(saved.storageKey);
});


test('large source images over the old 5 MB limit are reduced to WebP', async () => {
  const sharp = require('sharp');
  const { randomBytes } = require('crypto');
  const source = await sharp(randomBytes(2400 * 1800 * 3), { raw: { width: 2400, height: 1800, channels: 3 } }).png().toBuffer();
  assert.ok(source.length > 5 * 1024 * 1024);
  const { compressMediaImage } = load('src/lib/media-image.ts');
  const output = await compressMediaImage(source);
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 1600);
  assert.equal(metadata.height, 1200);
  assert.ok(output.length < source.length / 2);
});
