import escapeStringRegExp from 'escape-string-regexp'

// Retrieve `forRegExp` which is a `RegExp` used to match the `for` path
export const getForRegExp = function (forPath: string): RegExp {
  const pattern = forPath.split('/').map(trimString).filter(Boolean).map(getPartRegExp).join('/')
  return new RegExp(`^/${pattern}/?$`, 'iu')
}

const trimString = function (part: string): string {
  return part.trimEnd()
}

const getPartRegExp = function (part: string): string {
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
    return part.replaceAll('*', '(.*)')
  }

  return escapeStringRegExp(part)
}
