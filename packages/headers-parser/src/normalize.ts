import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'
import type { Mapper } from 'map-obj'

import { getForRegExp } from './for_regexp.js'
import { splitResults } from './results.js'
import type { Header } from './types.js'

// Validate and normalize an array of `headers` objects.
// This step is performed after `headers` have been parsed from either
// `netlify.toml` or `_headers`.
export const normalizeHeaders = function (headers: any, minimal: boolean) {
  if (!Array.isArray(headers)) {
    const error = new TypeError(`Headers must be an array not: ${headers}`)
    return splitResults([error])
  }

  const results = headers
    .map((header, index) => parseHeader(header, index, minimal))
    .filter<Header | Error>(Boolean as never)
  return splitResults(results)
}

const parseHeader = function (header: any, index: number, minimal: boolean) {
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
const parseHeaderObject = function ({ for: rawPath, values: rawValues }: any, minimal: boolean) {
  const forPath = normalizePath(rawPath)

  if (rawValues === undefined) {
    return
  }

  const values = normalizeValues(rawValues)

  if (Object.keys(values).length === 0) {
    return
  }

  const header: Header = {
    for: forPath,
    values,
  }

  if (!minimal) {
    header.forRegExp = getForRegExp(forPath)
  }

  return header
}

// Normalize and validate the `for` field
const normalizePath = function (rawPath: any) {
  if (rawPath === undefined) {
    throw new TypeError('Missing "for" field')
  }

  if (typeof rawPath !== 'string') {
    throw new TypeError(`"for" must be a string not: ${rawPath}`)
  }

  return rawPath.trim()
}

// Normalize and validate the `values` field
const normalizeValues = function (rawValues: Record<string, any>) {
  if (!isPlainObj(rawValues)) {
    throw new TypeError(`"values" must be an object not: ${rawValues}`)
  }

  return mapObj(rawValues, normalizeValue)
}

// Normalize and validate each header `values`
const normalizeValue: Mapper<Record<string, any>, string, any> = function (rawKey: string, rawValue: any) {
  const key: string = rawKey.trim()
  if (key === '' || key === 'undefined') {
    throw new Error('Empty header name')
  }

  const value = normalizeRawValue(key, rawValue)
  return [key, value]
}

const normalizeRawValue = function (key: string, rawValue: any): string {
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
const normalizeMultipleValues = function (value: string) {
  return value.split(MULTIPLE_VALUES_REGEXP).join(', ')
}

const MULTIPLE_VALUES_REGEXP = /\s*,\s*/g

const normalizeArrayItemValue = function (key: string, singleValue: any) {
  if (typeof singleValue !== 'string') {
    throw new TypeError(`Header "${key}" value must be a string not: ${singleValue}`)
  }

  return normalizeStringValue(singleValue)
}

const normalizeStringValue = function (stringValue: string) {
  return stringValue.trim()
}
