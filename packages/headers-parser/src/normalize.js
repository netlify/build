import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { getForRegExp } from './for_regexp.js'
import { splitResults } from './results.js'

// Validate and normalize an array of `headers` objects.
// This step is performed after `headers` have been parsed from either
// `netlify.toml` or `_headerss`.
export const normalizeHeaders = function (headers, minimal) {
  if (!Array.isArray(headers)) {
    const error = new TypeError(`Headers must be an array not: ${headers}`)
    return splitResults([error])
  }

  const results = headers.map((header, index) => parseHeader(header, index, minimal)).filter(Boolean)
  return splitResults(results)
}

const parseHeader = function (header, index, minimal) {
  if (!isPlainObj(header)) {
    return new TypeError(`Header must be an object not: ${header}`)
  }

  try {
    return parseHeaderObject(header, minimal)
  } catch (error) {
    return new Error(`Could not parse header number ${index + 1}:
  ${JSON.stringify(header)}
${error.message}`)
  }
}

// Parse a single `headers` object
const parseHeaderObject = function ({ for: rawPath, values: rawValues }, minimal) {
  const forPath = normalizePath(rawPath)

  if (rawValues === undefined) {
    return
  }

  const values = normalizeValues(rawValues)

  if (Object.keys(values).length === 0) {
    return
  }

  return {
    for: forPath,
    ...(minimal || { forRegExp: getForRegExp(forPath) }),
    values,
  }
}

// Normalize and validate the `for` field
const normalizePath = function (rawPath) {
  if (rawPath === undefined) {
    throw new TypeError('Missing "for" field')
  }

  if (typeof rawPath !== 'string') {
    throw new TypeError(`"for" must be a string not: ${rawPath}`)
  }

  return rawPath.trim()
}

// Normalize and validate the `values` field
const normalizeValues = function (rawValues) {
  if (!isPlainObj(rawValues)) {
    throw new TypeError(`"values" must be an object not: ${rawValues}`)
  }

  return mapObj(rawValues, normalizeValue)
}

// Normalize and validate each header `values`
const normalizeValue = function (rawKey, rawValue) {
  const key = rawKey.trim()
  if (key === '' || key === 'undefined') {
    throw new Error('Empty header name')
  }

  const value = normalizeRawValue(key, rawValue)
  return [key, value]
}

const normalizeRawValue = function (key, rawValue) {
  if (typeof rawValue === 'string') {
    return normalizeMultipleValues(normalizeStringValue(rawValue))
  }

  if (Array.isArray(rawValue)) {
    return rawValue.map((singleValue, index) => normalizeArrayItemValue(`${key}[${index}]`, singleValue)).join(', ')
  }

  throw new TypeError(`Header "${key}" value must be a string not: ${rawValue}`)
}

// Multiple values can be specified by using whitespaces and commas.
// For example:
//   [[headers]]
//   for = "/*"
//     [headers.values]
// 	   cache-control = '''
// 	   max-age=0,
// 	   no-cache,
// 	   no-store,
// 	   must-revalidate'''
// Is normalized to:
//   [[headers]]
//   for = "/*"
//     [headers.values]
// 	   cache-control = "max-age=0, no-cache, no-store, must-revalidate"
const normalizeMultipleValues = function (value) {
  return value.split(MULTIPLE_VALUES_REGEXP).join(', ')
}

const MULTIPLE_VALUES_REGEXP = /\s*,\s*/g

const normalizeArrayItemValue = function (key, singleValue) {
  if (typeof singleValue !== 'string') {
    throw new TypeError(`Header "${key}" value must be a string not: ${singleValue}`)
  }

  return normalizeStringValue(singleValue)
}

const normalizeStringValue = function (stringValue) {
  return stringValue.trim()
}
