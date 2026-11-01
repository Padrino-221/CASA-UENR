/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');
function load(extra = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/cms/upload-image.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { exports, File, FormData, ...extra });
  return exports;
}
test('large photos are resized before the request is sent', async () => {
  let revoked = false;
  const api = load({
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => { revoked = true; } },
    Image: class { naturalWidth = 6000; naturalHeight = 4000; async decode() {} },
    document: { createElement: () => ({ getContext: () => ({ drawImage() {} }), toBlob: callback => callback(new Blob(['webp'], { type: 'image/webp' })) }) },
    fetch: async (_url, options) => {
      const image = options.body.get('file');
      assert.equal(image.type, 'image/webp');
      assert.ok(image.size < 3_800_000);
      return Response.json({ url: '/api/media/test' }, { status: 201 });
    },
  });
  assert.equal((await api.uploadCmsImage(new File([new Uint8Array(5_000_000)], 'photo.jpg'))).url, '/api/media/test');
  assert.equal(revoked, true);
});
test('platform HTML errors and expired sessions have useful messages', async () => {
  for (const [status, message] of [[413, /image size/], [401, /session has expired/], [500, /Upload failed/]]) {
    const api = load({ fetch: async () => new Response('HTML error', { status }) });
    await assert.rejects(api.uploadCmsImage(new File(['photo'], 'photo.jpg')), message);
  }
});
