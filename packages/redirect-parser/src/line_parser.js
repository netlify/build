import { promises as fs } from 'fs'

import { pathExists } from 'path-exists'

import { splitResults } from './results.js'
import { transtypeStatusCode, isValidStatusCode } from './status.js'
import { isUrl } from './url.js'

// Parse `_redirects` file to an array of objects.
// Each line in that file must be either:
//  - An empty line
//  - A comment starting with #
//  - A redirect line, optionally ended with a comment
// Each redirect line has the following format:
//   from [query] [to] [status[!]] [conditions]
// The parts are:
//  - "from": a path or a URL
//  - "query": a whitespace-separated list of "key=value"
//  - "to": a path or a URL
//  - "status": an HTTP status integer
//  - "!": an optional exclamation mark appended to "status" meant to indicate
//    "forced"
//  - "conditions": a whitespace-separated list of "key=value"
//     - "Sign" is a special condition
// Unlike "redirects" in "netlify.toml", the "headers" and "edge_handlers"
// cannot be specified.
export const parseFileRedirects = async function (redirectFile) {
  const results = await parseRedirects(redirectFile)
  return splitResults(results)
}

const parseRedirects = async function (redirectFile) {
  if (!(await pathExists(redirectFile))) {
    return []
  }

  const text = await readRedirectFile(redirectFile)
  if (typeof text !== 'string') {
    return [text]
  }
  return text
    .split('\n')
    .map(normalizeLine)
    .filter(hasRedirect)
    .map((redirectLine) => parseRedirect(redirectLine))
}

const readRedirectFile = async function (redirectFile) {
  try {
    return await fs.readFile(redirectFile, 'utf8')
  } catch {
    return new Error(`Could not read redirects file: ${redirectFile}`)
  }
}

const normalizeLine = function (line, index) {
  return { line: line.trim(), index }
}

const hasRedirect = function ({ line }) {
  return line !== '' && !isComment(line)
}

const parseRedirect = function ({ line, index }) {
  try {
    return parseRedirectLine(line)
  } catch (error) {
    return new Error(`Could not parse redirect line ${index + 1}:
  ${line}
${error.message}`)
  }
}

// Parse a single redirect line
const parseRedirectLine = function (line) {
  const [from, ...parts] = trimComment(line.split(LINE_TOKENS_REGEXP))

  if (parts.length === 0) {
    throw new Error('Missing destination path/URL')
  }

  const {
    queryParts,
    to,
    lastParts: [statusPart, ...conditionsParts],
  } = parseParts(from, parts)

  const query = parsePairs(queryParts)
  const { status, force } = parseStatus(statusPart)
  const { Sign, signed = Sign, ...conditions } = parsePairs(conditionsParts)
  return { from, query, to, status, force, conditions, signed }
}

// Removes inline comments at the end of the line
const trimComment = function (parts) {
  const commentIndex = parts.findIndex(isComment)
  return commentIndex === -1 ? parts : parts.slice(0, commentIndex)
}

const isComment = function (part) {
  return part.startsWith('#')
}

const LINE_TOKENS_REGEXP = /\s+/g

// Figure out the purpose of each whitelist-separated part, taking into account
// the fact that some are optional.
const parseParts = function (from, parts) {
  // Optional `to` field when using a forward rule.
  // The `to` field is added and validated later on, so we can leave it
  // `undefined`
  if (isValidStatusCode(transtypeStatusCode(parts[0]))) {
    return { queryParts: [], to: undefined, lastParts: parts }
  }

  const toIndex = parts.findIndex(isToPart)
  if (toIndex === -1) {
    throw new Error('The destination path/URL must start with "/", "http:" or "https:"')
  }

  const queryParts = parts.slice(0, toIndex)
  const to = parts[toIndex]
  const lastParts = parts.slice(toIndex + 1)
  return { queryParts, to, lastParts }
}

const isToPart = function (part) {
  return part.startsWith('/') || isUrl(part)
}

// Parse the `status` part
const parseStatus = function (statusPart) {
  if (statusPart === undefined) {
    return {}
  }

  const status = transtypeStatusCode(statusPart)

  if (!isValidStatusCode(status)) {
    return { status: statusPart, force: false }
  }

  const force = statusPart.endsWith('!')
  return { status, force }
}

// Part key=value pairs used for both the `query` and `conditions` parts
const parsePairs = function (conditions) {
  return Object.assign({}, ...conditions.map(parsePair))
}

const parsePair = function (condition) {
  const [key, value] = condition.split('=')
  return { [key]: value }
}
