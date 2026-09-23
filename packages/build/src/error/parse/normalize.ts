export type NormalizedError = Error & { stack: string; errors?: unknown }

// Ensure error is an `Error` instance.
// If is an `Error` instance but is missing usual `Error` properties, we make
// sure its static properties are preserved.
export const normalizeError = function (error: unknown): NormalizedError {
  if (Array.isArray(error)) {
    return normalizeArray(error)
  }

  if (!(error instanceof Error)) {
    // V8 gives new errors a string `stack` unless `Error.stackTraceLimit` is not a number
    return new Error(String(error)) as NormalizedError
  }

  if (typeof error.message !== 'string') {
    error.message = String(error)
  }

  if (typeof error.stack !== 'string') {
    Error.captureStackTrace(error, normalizeError)
  }

  // Either already a string or set by `captureStackTrace()`, with the same caveat as above
  return error as NormalizedError
}

// Some libraries throw arrays of Errors
const normalizeArray = function (errorArray: unknown[]): NormalizedError {
  const normalizedErrors = errorArray.map(normalizeError)
  const error = normalizedErrors.at(0)
  const [, ...errors] = normalizedErrors
  if (error === undefined) {
    // Same crash as before: an empty array has no error to attach `errors` to
    throw new TypeError("Cannot set properties of undefined (setting 'errors')")
  }
  error.errors = errors
  return error
}
