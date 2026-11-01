/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
test('hero advances every five seconds, pauses on hover and resumes on leave', () => {
  const state = []; let cursor = 0; let effect; let tick; let delay; let cleared = false;
  const exports = {};
  const react = {
    useState(initial) { const key = cursor++; if (!(key in state)) state[key] = initial; return [state[key], value => { state[key] = typeof value === 'function' ? value(state[key]) : value; }]; },
    useEffect(callback) { effect = callback; },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/site/HeroCarousel.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: name => name === 'react' ? react : name === 'react/jsx-runtime' ? require(name) : { default: () => null },
    window: { matchMedia: () => ({ matches: true }), setInterval(callback, ms) { tick = callback; delay = ms; return 1; }, clearInterval() { cleared = true; } },
  });
  const render = () => { cursor = 0; return exports.default({ slides: [{ image: '/one.jpg', alt: 'One' }, { image: '/two.jpg', alt: 'Two' }] }); };
  let tree = render(); let cleanup = effect();
  assert.equal(delay, 5000);
  tick(); assert.equal(state[0], 1);
  tree.props.onMouseEnter(); cleanup(); assert.equal(cleared, true);
  tick = null; tree = render(); assert.equal(effect(), undefined); assert.equal(tick, null);
  tree.props.onMouseLeave(); tree = render(); cleanup = effect(); assert.equal(typeof tick, 'function');
  tick(); assert.equal(state[0], 0);
  assert.equal(tree.props.onFocusCapture, undefined);
  cleanup();
});
