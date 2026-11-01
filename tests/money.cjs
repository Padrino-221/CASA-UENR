/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/lib/money.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
vm.runInNewContext(source, { exports: exportsObject, require });
const { parseMoney, validTransactionType } = exportsObject;
test('currency parser preserves decimal cents exactly', () => {
  assert.equal(parseMoney('0.10').plus(parseMoney('0.20')).toFixed(2), '0.30');
  assert.equal(parseMoney('999999999999.99').toFixed(2), '999999999999.99');
});
test('currency rejects invalid, partial, negative, zero and excessive precision values', () => {
  for (const amount of [0, -1, '12oops', '1.001', '1e3', 'Infinity', 'NaN', '1000000000000', null, {}, true, '']) {
    assert.throws(() => parseMoney(amount), undefined, String(amount));
  }
});
test('transaction types allow only income and expense', () => {
  assert.equal(validTransactionType('INCOME'), true);
  assert.equal(validTransactionType('EXPENSE'), true);
  assert.equal(validTransactionType('OTHER'), false);
});
