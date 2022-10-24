import filterObj from 'filter-obj'
import isPlainObj from 'is-plain-obj'

import { normalizeConditions } from './conditions.js'
import { splitResults } from './results.js'
import { normalizeStatus } from './status.js'
import { isUrl } from './url.js'

// Validate and normalize an array of `redirects` objects.
// This step is performed after `redirects` have been parsed from either
// `netlify.toml` or `_redirects`.
export const normalizeRedirects = function (redirects, minimal) {
  if (!Array.isArray(redirects)) {
    const error = new TypeError(`Redirects must be an array not: ${redirects}`)
    return splitResults([error])
  }

  const results = redirects.map((obj, index) => parseRedirect(obj, index, minimal))
  return splitResults(results)
}

const parseRedirect = function (obj, index, minimal) {
  if (!isPlainObj(obj)) {
    return new TypeError(`Redirects must be objects not: ${obj}`)
  }

  try {
    return parseRedirectObject(obj, minimal)
  } catch (error) {
    return new Error(`Could not parse redirect number ${index + 1}:
  ${JSON.stringify(obj)}
${error.message}`)
  }
}

// Parse a single `redirects` object
const parseRedirectObject = function (
  {
    // `from` used to be named `origin`
    origin,
    from = origin,
    // `query` used to be named `params` and `parameters`
    parameters = {},
    params = parameters,
    query = params,
    // `to` used to be named `destination`
    destination,
    to = destination,
    status,
    force = false,
    conditions = {},
    // `signed` used to be named `signing` and `sign`
    sign,
    signing = sign,
    signed = signing,
    headers = {},
  },
  minimal,
) {
  if (from === undefined) {
    throw new Error('Missing "from" field')
  }

  if (!isPlainObj(headers)) {
    throw new Error('"headers" field must be an object')
  }

  const statusA = normalizeStatus(status)
  const finalTo = addForwardRule(from, statusA, to)
  const { scheme, host, path } = parseFrom(from)
  const proxy = isProxy(statusA, finalTo)
  const normalizedConditions = normalizeConditions(conditions)

  // We ensure the return value has the same shape as our `netlify-commons`
  // backend
  return removeUndefinedValues({
    from,
    query,
    to: finalTo,
    status: statusA,
    force,
    conditions: normalizedConditions,
    signed,
    headers,
    // If `minimal: true`, does not add additional properties that are not
    // valid in `netlify.toml`
    ...(!minimal && { scheme, host, path, proxy }),
  })
}

// Add the optional `to` field when using a forward rule
const addForwardRule = function (from, status, to) {
  if (to !== undefined) {
    return to
  }

  if (!isSplatRule(from, status)) {
    throw new Error('Missing "to" field')
  }

  return from.replace(SPLAT_REGEXP, '/:splat')
}

// "to" can only be omitted when using forward rules:
//  - This requires "from" to end with "/*" and "status" to be 2**
//  - "to" will then default to "from" but with "/*" replaced to "/:splat"
const isSplatRule = function (from, status) {
  return from.endsWith('/*') && status >= 200 && status < 300
}

const SPLAT_REGEXP = /\/\*$/

// Parses the `from` field which can be either a file path or a URL.
const parseFrom = function (from) {
  const { scheme, host, path } = parseFromField(from)
  if (path.startsWith('/.netlify')) {
    throw new Error('"path" field must not start with "/.netlify"')
  }

  return { scheme, host, path }
}

const parseFromField = function (from) {
  if (!isUrl(from)) {
    return { path: from }
  }

  try {
    const { host, protocol, pathname: path } = new URL(from)
    const scheme = protocol.slice(0, -1)
    return { scheme, host, path }
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`)
  }
}

const isProxy = function (status, to) {
  return status === 200 && isUrl(to)
}

const removeUndefinedValues = function (object) {
  return filterObj(object, isDefined)
}

const isDefined = function (key, value) {
  return value !== undefined
}
