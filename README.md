# koi8-r-russian-decoder

Converts bytes in KOI8-R Cyrillic encoding to Unicode strings via a fixed lookup table. Exports `decodeBytes`, `decodeString`, and `validate`, plus the underlying `KOI8R_RUSSIAN_UPPER`, `KOI8R_RUSSIAN_LOWER`, and `PSEUDO_GRAPHICS` code-point maps.

## Usage

```js
import { decodeBytes, decodeString, validate } from 'koi8-r-russian-decoder';

// From raw bytes (Uint8Array or any array-like of 0-255 integers)
const text = decodeBytes(new Uint8Array([0xc1, 0xe1]));
// => "Аа" (U+0410, U+0430)

// From a binary string where each char code is a byte value
const same = decodeString('\u00c1\u00e1');
// => "Аа"

// Check whether every byte has a defined mapping
const report = validate(new Uint8Array([0x41, 0xf8]));
// => { valid: false, invalidBytes: [1] }
```

## Why

The built-in `TextDecoder('koi8r')` is unavailable in Node.js and many browsers, so decoding legacy Russian text requires shipping the mapping yourself. This library does exactly that — a 256-entry table covering ASCII, KOI8-R Cyrillic, box-drawing pseudographics, and the letters Ё/ё — and nothing else. The trade-off is a slightly larger bundle in exchange for zero runtime dependencies and predictable, table-driven output.

## Edge cases

- Bytes above 0x7F that are not assigned in KOI8-R (notably the 0xf8-0xff band) decode to U+FFFD. `validate()` reports their offsets so callers can decide whether to reject or substitute.
- `decodeString` reads `charCodeAt`, so only the low 8 bits of each character matter — pass a true binary string, not arbitrary Unicode.
