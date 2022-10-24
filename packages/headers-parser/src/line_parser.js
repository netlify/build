import { promises as fs } from 'fs'

import { pathExists } from 'path-exists'

import { splitResults } from './results.js'

// Parse `_headers` file to an array of objects following the same syntax as
// the `headers` property in `netlify.toml`
export const parseFileHeaders = async function (headersFile) {
  const results = await parseHeaders(headersFile)
  const { headers, errors: parseErrors } = splitResults(results)
  const { headers: reducedHeaders, errors: reducedErrors } = headers.reduce(reduceLine, { headers: [], errors: [] })
  const errors = [...parseErrors, ...reducedErrors]
  return { headers: reducedHeaders, errors }
}

const parseHeaders = async function (headersFile) {
  if (!(await pathExists(headersFile))) {
    return []
  }

  const text = await readHeadersFile(headersFile)
  if (typeof text !== 'string') {
    return [text]
  }
  return text.split('\n').map(normalizeLine).filter(hasHeader).map(parseLine).filter(Boolean)
}

const readHeadersFile = async function (headersFile) {
  try {
    return await fs.readFile(headersFile, 'utf-8')
  } catch {
    return new Error(`Could not read headers file: ${headersFile}`)
  }
}

const normalizeLine = function (line, index) {
  return { line: line.trim(), index }
}

const hasHeader = function ({ line }) {
  return line !== '' && !line.startsWith('#')
}

const parseLine = function ({ line, index }) {
  try {
    return parseHeaderLine(line)
  } catch (error) {
    return new Error(`Could not parse header line ${index + 1}:
  ${line}
${error.message}`)
  }
}

// Parse a single header line
const parseHeaderLine = function (line) {
  if (isPathLine(line)) {
    return { path: line }
  }

  if (!line.includes(HEADER_SEPARATOR)) {
    return
  }

  const [rawName, ...rawValue] = line.split(HEADER_SEPARATOR)
  const name = rawName.trim()

  if (name === '') {
    throw new Error(`Missing header name`)
  }

  const value = rawValue.join(HEADER_SEPARATOR).trim()
  if (value === '') {
    throw new Error(`Missing header value`)
  }

  return { name, value }
}

const isPathLine = function (line) {
  return line.startsWith('/')
}

const HEADER_SEPARATOR = ':'

const reduceLine = function ({ headers, errors }, { path, name, value }) {
  if (path !== undefined) {
    return { headers: [...headers, { for: path, values: {} }], errors }
  }

  if (headers.length === 0) {
    const error = new Error(`Path should come before header "${name}"`)
    return { headers, errors: [...errors, error] }
  }

  const previousHeaders = headers.slice(0, -1)
  const currentHeader = headers[headers.length - 1]
  const { values } = currentHeader
  const newValue = values[name] === undefined ? value : `${values[name]}, ${value}`
  const newHeaders = [...previousHeaders, { ...currentHeader, values: { ...values, [name]: newValue } }]
  return { headers: newHeaders, errors }
}
