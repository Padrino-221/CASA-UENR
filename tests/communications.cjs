/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}, globals = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: id => {
    if (id in mocks) return mocks[id];
    if (id === './sms-format' || id === '@/lib/sms-format') return load('src/lib/sms-format.ts', mocks, globals);
    if (id === '@/lib/sms') return load('src/lib/sms.ts', mocks, globals);
    return require(id);
  }, console, URL, Request, Response, AbortSignal, process: { env: { SITE_CHAPTER_ID: 'chapter-a', ARKESEL_API_KEY: 'test-only-key', ARKESEL_SENDER_ID: 'CASA' } }, fetch: () => { throw new Error('Unexpected network call in test'); }, ...globals });
  return exports;
}
const json = { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } };
const session = role => role ? { user: { id: 'secretary-a', role, chapterId: 'chapter-a' } } : null;
function route(path, role, db, mocks = {}) {
  const secretary = load('src/lib/secretary.ts', { '@/auth': { auth: async () => session(role) } });
  return load(`src/app/api/${path}/route.ts`, { 'next/server': json, '@/lib/prisma': { db }, '@/lib/secretary': secretary, ...mocks });
}
const post = body => new Request('http://local', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const params = { params: Promise.resolve({ id: 'draft-a' }) };

test('only secretaries may read messages or create and send announcements', async () => {
  for (const role of [null, 'NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN', 'FINANCE', 'CONTENT_MANAGER']) {
    assert.equal((await route('messages', role, {}).GET(new Request('http://local'))).status, 403);
    assert.equal((await route('messages', role, {}).PATCH(post({}))).status, 403);
    assert.equal((await route('announcements', role, {}).GET()).status, 403);
    assert.equal((await route('announcements', role, {}).POST(post({}))).status, 403);
    assert.equal((await route('announcements/[id]/send', role, {}).POST(post({ confirm: true }), params)).status, 403);
  }
});

test('messages stay scoped to the secretary chapter including status updates', async () => {
  const where = [];
  const api = route('messages', 'SECRETARY', { contactMessage: {
    findMany: async args => { where.push(args.where); return []; },
    count: async args => { where.push(args.where); return 0; },
    updateMany: async args => { assert.equal(args.where.chapterId, 'chapter-a'); assert.equal(args.where.id, 'foreign-message'); return { count: 0 }; },
  } });
  const result = await api.GET(new Request('http://local?chapterId=chapter-b'));
  assert.equal(result.status, 200); where.forEach(filter => assert.equal(filter.chapterId, 'chapter-a'));
  assert.equal((await api.PATCH(post({ id: 'foreign-message', status: 'READ' }))).status, 404);
});

test('public contact messages go to the configured chapter and ignore a forged chapter', async () => {
  let saved;
  const api = route('contact', null, { chapter: { findUnique: async () => ({ id: 'chapter-a' }) }, contactMessage: { create: async ({ data }) => { saved = data; } } });
  const result = await api.POST(post({ name: 'Visitor', email: 'visitor@example.test', topic: 'First visit', message: 'Where do you meet?', chapterId: 'foreign' }));
  assert.equal(result.status, 201); assert.equal(saved.chapterId, 'chapter-a'); assert.equal(saved.status, undefined);
});

test('contact validation and honeypot reject submissions without storing them', async () => {
  const api = route('contact', null, {});
  assert.equal((await api.POST(post({ name: 'Visitor', email: 'invalid', topic: 'Hello', message: 'Hello' }))).status, 400);
  assert.equal((await api.POST(post({ website: 'spam' }))).status, 200);
});

test('announcement previews deduplicate phones and only select active chapter members', async () => {
  let saved;
  const api = route('announcements', 'SECRETARY', {
    student: { findMany: async args => { assert.equal(args.where.chapterId, 'chapter-a'); assert.equal(args.where.status, 'ACTIVE'); return [{ id: 'a', phone: '024 123 4567' }, { id: 'b', phone: '+233241234567' }, { id: 'c', phone: 'invalid' }]; } },
    announcement: { create: async ({ data }) => { saved = data; return { id: 'draft-a', ...data }; } },
  });
  const result = await api.POST(post({ title: 'Sunday', message: 'See you at church', audience: 'ACTIVE_MEMBERS' }));
  assert.equal(result.status, 201); assert.equal(saved.recipientCount, 1); assert.equal(saved.skippedCount, 2);
  assert.equal(saved.recipients[0], '233241234567');
});

test('secretary cannot select members from another chapter for SMS', async () => {
  const api = route('announcements', 'SECRETARY', { student: { findMany: async () => [] } });
  assert.equal((await api.POST(post({ title: 'Test', message: 'Test', audience: 'SELECTED', studentIds: ['foreign'] }))).status, 403);
});

test('announcement sending claims a draft once and never resends accepted submissions', async () => {
  let status = 'DRAFT'; let sends = 0;
  const api = route('announcements/[id]/send', 'SECRETARY', { announcement: {
    findFirst: async ({ where }) => { assert.equal(where.chapterId, 'chapter-a'); return { id: 'draft-a', sender: 'CASA', message: 'Hello', recipients: ['233241234567'] }; },
    updateMany: async () => { if (status !== 'DRAFT') return { count: 0 }; status = 'SENDING'; return { count: 1 }; },
    update: async ({ data }) => { status = data.status; },
  } }, { '@/lib/sms': { smsConfiguration: () => ({ configured: true, sender: 'CASA' }), sendArkeselSms: async () => { sends++; return { accepted: true, data: { status: 'success' } }; } } });
  assert.equal((await api.POST(post({ confirm: true }), params)).status, 200); assert.equal(status, 'ACCEPTED');
  assert.equal((await api.POST(post({ confirm: true }), params)).status, 409); assert.equal(sends, 1);
});

test('ambiguous SMS failures remain unknown instead of enabling automatic retry', async () => {
  let status;
  const api = route('announcements/[id]/send', 'SECRETARY', { announcement: {
    findFirst: async () => ({ sender: 'CASA', message: 'Hello', recipients: ['233241234567'] }),
    updateMany: async () => ({ count: 1 }), update: async ({ data }) => { status = data.status; },
  } }, { '@/lib/sms': { smsConfiguration: () => ({ configured: true, sender: 'CASA' }), sendArkeselSms: async () => { throw new Error('timeout'); } } });
  assert.equal((await api.POST(post({ confirm: true }), params)).status, 502); assert.equal(status, 'UNKNOWN');
});

test('Arkesel uses the v2 JSON API with a server-side API key', async () => {
  let call;
  const api = load('src/lib/sms.ts', {}, { fetch: async (url, options) => { call = { url, options }; return new Response(JSON.stringify({ status: 'success' }), { status: 200 }); } });
  assert.equal((await api.sendArkeselSms('CASA', 'Hello', ['233241234567'])).accepted, true);
  assert.equal(call.url, 'https://sms.arkesel.com/api/v2/sms/send');
  assert.equal(call.options.headers['api-key'], 'test-only-key');
  assert.equal(JSON.parse(call.options.body).recipients[0], '233241234567');
});

test('SMS estimates account for multipart, extended GSM, and Unicode characters', () => {
  const api = load('src/lib/sms-format.ts');
  assert.equal(api.smsSegments('a'.repeat(160)).segments, 1);
  assert.equal(api.smsSegments('a'.repeat(161)).segments, 2);
  assert.equal(api.smsSegments('^'.repeat(81)).segments, 2);
  assert.equal(api.smsSegments('🙂'.repeat(36)).segments, 2);
  assert.equal(api.normalisePhone('024 123 4567'), '233241234567');
  assert.equal(api.normalisePhone('bad number'), null);
});
