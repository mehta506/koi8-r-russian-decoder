import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeBytes, decodeString, validate, KOI8R_RUSSIAN_UPPER, KOI8R_RUSSIAN_LOWER, PSEUDO_GRAPHICS } from '../src/index.js';

test('ASCII bytes pass through unchanged', () => {
  assert.equal(decodeBytes(new Uint8Array([72, 101, 108, 108, 111])), 'Hello');
});

test('empty input yields empty string', () => {
  assert.equal(decodeBytes(new Uint8Array([])), '');
  assert.equal(decodeString(''), '');
});

test('decodes uppercase Russian KOI8-R letter', () => {
  const bytes = new Uint8Array([0xc1, 0xc2]);
  const got = decodeBytes(bytes);
  assert.equal(got.charCodeAt(0), KOI8R_RUSSIAN_LOWER[0xc1]);
  assert.equal(got.charCodeAt(1), KOI8R_RUSSIAN_LOWER[0xc2]);
});

test('decodes lowercase Russian KOI8-R letter', () => {
  const bytes = new Uint8Array([0xe1, 0xe2]);
  const got = decodeBytes(bytes);
  assert.equal(got.charCodeAt(0), KOI8R_RUSSIAN_UPPER[0xe1]);
  assert.equal(got.charCodeAt(1), KOI8R_RUSSIAN_UPPER[0xe2]);
});

test('decodes pseudographics box-drawing characters', () => {
  assert.equal(decodeBytes(new Uint8Array([0x80])).codePointAt(0), PSEUDO_GRAPHICS[0x80]);
});

test('decodes Ё (0xb3 uppercase and 0xa3 lowercase)', () => {
  assert.equal(decodeBytes(new Uint8Array([0xb3])).codePointAt(0), 0x0401);
  assert.equal(decodeBytes(new Uint8Array([0xa3])).codePointAt(0), 0x0451);
});

test('decodeString works the same as decodeBytes for equal inputs', () => {
  const u = new Uint8Array([0x48, 0xc1, 0xe1]);
  assert.equal(decodeString(String.fromCharCode(0x48, 0xc1, 0xe1)), decodeBytes(u));
});

test('validate returns valid:true for all-mapped bytes', () => {
  const r = validate(new Uint8Array([0x41, 0xc1, 0xe1]));
  assert.equal(r.valid, true);
  assert.deepEqual(r.invalidBytes, []);
});

test('validate flags unmapped bytes (0xf8-0xff gap)', () => {
  const r = validate(new Uint8Array([0x41, 0xf8, 0xf9, 0x41]));
  assert.equal(r.valid, false);
  assert.deepEqual(r.invalidBytes, [1, 2]);
});

test('validate flags an unmapped byte in the 0xa0-0xff range', () => {
  const r = validate(new Uint8Array([0xa5]));
  assert.equal(r.valid, false);
  assert.deepEqual(r.invalidBytes, [0]);
});

test('decodeBytes throws on null input', () => {
  assert.throws(() => decodeBytes(null), TypeError);
});

test('decodeString throws on non-string input', () => {
  assert.throws(() => decodeString(42), TypeError);
});

test('decoding a byte that is invalid yields U+FFFD', () => {
  assert.equal(decodeBytes(new Uint8Array([0xf8])).codePointAt(0), 0xfffd);
});

test('works with a regular Array as input (array-like)', () => {
  assert.equal(decodeBytes([0x41, 0xc1]), decodeBytes(new Uint8Array([0x41, 0xc1])));
});
