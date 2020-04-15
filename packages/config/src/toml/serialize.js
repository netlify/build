const indentString = require('indent-string')
const isPlainObj = require('is-plain-obj')
const stripIndent = require('strip-indent')

// There are no libraries to serialize TOML in Node.js.
// We need to print netlify.toml content after transforming it, so we need to
// implement our own serializer. This is imperfect but only used in examples
// that are printed in config validation errors.
const serializeToml = function(value) {
  if (!isPlainObj(value)) {
    return serializeScalarValue(value)
  }

  // If there are only deep values like {a:{b:{c:1}}}, we want to remove the
  // additional indent
  return stripIndent(serializeObject([], value))
}

// Serialize { a: 1, b: {c: 2}, d: [{e: 3}, {f: 4}] } to:
//   a = 1
//
//   [b]
//   c = 2
//
//   [[d]]
//   e = 3
//
//   [[d]]
//   f = 4
const serializeObject = function(keys, object, isArray) {
  const pairs = Object.entries(object)
  const scalarPairs = serializeScalars(pairs)
  const objectPairs = serializeObjects(keys, pairs)
  const arrayPairs = serializeArrays(keys, pairs)
  const content = [scalarPairs, ...objectPairs, ...arrayPairs].filter(Boolean).join('\n\n')
  const header = serializeHeader(keys, isArray, scalarPairs, content)
  const objectString = `${header}${content}`.trimRight()
  const indentedString = indentObject(objectString, keys)
  return indentedString
}

// Serialize key/value pair of scalars [['a', 1], ['b', 2]] to:
//   a = 1
//   b = 2
const serializeScalars = function(pairs) {
  return pairs
    .filter(isScalar)
    .map(serializeScalar)
    .join('\n')
}

const isScalar = function([, value]) {
  return !isPlainObj(value) && !isArrayOfObjects(value)
}

const serializeScalar = function([key, scalar]) {
  return `${serializeKey(key)} = ${serializeScalarValue(scalar)}`
}

const serializeScalarValue = function(value) {
  if (Array.isArray(value)) {
    return `[${value.map(item => JSON.stringify(item)).join(', ')}]`
  }

  return JSON.stringify(value)
}

// Serialize several objects (see above)
const serializeObjects = function(keys, pairs) {
  return pairs.filter(isObjectPair).map(([key, object]) => serializeObject([...keys, key], object))
}

const isObjectPair = function([, value]) {
  return isPlainObj(value)
}

// Serialize { d: [{e: 3}, {f: 4}] } to:
//   [[d]]
//   e = 3
//
//   [[d]]
//   f = 4
const serializeArrays = function(keys, pairs) {
  return pairs.filter(isArrayPair).flatMap(([key, array]) => serializeArray([...keys, key], array))
}

const isArrayPair = function([, value]) {
  return isArrayOfObjects(value)
}

const isArrayOfObjects = function(value) {
  return Array.isArray(value) && value.length !== 0 && value.every(isPlainObj)
}

const serializeArray = function(keys, array) {
  return array.map(item => serializeObject(keys, item, true))
}

// Serialize [...] header
const serializeHeader = function(keys, isArray, scalarPairs, content) {
  // Instead of:
  //   [a]
  //   [a.b]
  //   c = 1
  // We simplify to:
  //   [a.b]
  //   c = 1
  if (scalarPairs === '' && content !== '' && !isArray) {
    return ''
  }

  return serializeKeys(keys, isArray)
}

// Serialize key ['a', 'b', 'c.d'] to:
//   [a.b."c.d"]
// Arrays have extra brackets
//   [[a.b."c.d"]]
const serializeKeys = function(keys, isArray) {
  // Top-level key is not printed
  if (keys.length === 0) {
    return ''
  }

  const keysString = keys.map(serializeKey).join('.')
  return isArray ? `[[${keysString}]]\n` : `[${keysString}]\n`
}

// Keys must be escaped when they contain some forbidden characters
const serializeKey = function(key) {
  if (KEY_ALLOWED_CHARS_REGEXP.test(key)) {
    return key
  }

  return `"${key}"`
}

const KEY_ALLOWED_CHARS_REGEXP = /^[\w-]+$/

// Indent sub-objects and sub-arrays:
//   a = 1
//
//   [b]
//   c = 2
//
//     [[d.e]]
//     f = 3
//
//       [d.e.g]
//       h = 4
const indentObject = function(objectString, keys) {
  if (keys.length <= 1) {
    return objectString
  }

  return indentString(objectString, INDENT_LENGTH)
}

const INDENT_LENGTH = 2

module.exports = { serializeToml }
