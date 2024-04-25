import escapeStringRegExp from 'escape-string-regexp'

// Retrieve `forRegExp` which is a `RegExp` used to match the `for` path
export const getForRegExp = function (forPath) {
  const pattern = forPath.split('/').map(trimString).filter(Boolean).map(getPartRegExp).join('/')
  return new RegExp(`^/${pattern}/?$`, 'iu')
}

const trimString = function (part) {
  return part.trimEnd()
}

const getPartRegExp = function (part) {
  // Placeholder like `/segment/:placeholder/test`
  // Matches everything up to a /
  if (part.startsWith(':')) {
    return '([^/]+)'
  }

  // Standalone catch-all wildcard like `/segment/*`
  // Unlike `:placeholder`, the whole part is optional
  if (part === '*') {
    return '?(.*)'
  }

  // Non-standalone catch-all wildcard like `/segment/hello*world/test`
  if (part.includes('*')) {
    // @todo use `part.replaceAll('*', ...)` after dropping support for
    // Node <15.0.0
    return part.replace(CATCH_ALL_CHAR_REGEXP, '(.*)')
  }

  return escapeStringRegExp(part)
}

const CATCH_ALL_CHAR_REGEXP = /\*/g
