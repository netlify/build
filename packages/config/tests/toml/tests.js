const test = require('ava')
const { each } = require('test-each')
const { parse: loadToml } = require('toml')

require('../../src/utils/polyfills.js')
const { serializeToml } = require('../../src/toml/serialize')

each(
  [
    {},
    { a: 1 },
    { a: 1, b: 2 },
    { a: '' },
    { a: ' ' },
    { a: '\n' },
    { a: '\u{001f}' },
    { a: '\0' },
    { a: 'true' },
    { a: true },
    { a: 5 },
    { a: 5.3 },
    { a: [] },
    { a: [{}] },
    { a: ['a', 'b'] },
    { a: {} },
    { a: { b: 1 } },
    { a: { b: 1, c: 2 } },
    { a: [{ b: 1 }, { c: 2 }] },
    { a: { b: {} } },
    { a: { b: { c: 1 } } },
    { a: { b: { c: { d: 1 } } } },
    { a: [{ b: { c: [{ d: 1 }] } }] },
    { a: [{ b: { c: [{ d: 1, e: 2 }, { f: 3 }], g: 4 }, h: 5 }] },
    { a: { 'b.c': 1 } },
    { a: { 'b.c': { d: 1 } } },
  ],
  ({ title }, object) => {
    test(`TOML serialization | ${title}`, t => {
      const string = serializeToml(object)
      t.snapshot(string)
      const objectAgain = loadToml(string)
      t.deepEqual(object, objectAgain)
    })
  },
)

// Those types are not allowed in a TOML file according to the spec.
// But we allow them for resiliency.
each(
  [
    // TOML spec only allows top-level plain objects,
    '',
    ' ',
    '\n',
    'true',
    true,
    5,
    5.3,
    [],
    ['a', 'b'],
    // TOML spec does not only mixing objects and non-objects in an array
    { a: [{ b: 1 }, 'true'] },
  ],
  ({ title }, object) => {
    test(`TOML serialization | ${title}`, t => {
      const string = serializeToml(object)
      t.snapshot(string)
    })
  },
)
