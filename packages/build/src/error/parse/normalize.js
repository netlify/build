// Ensure error is an `Error` instance.
// If is an `Error` instance but is missing usual `Error` properties, we make
// sure its static properties are preserved.
export const normalizeError = function (error) {
  if (Array.isArray(error)) {
    return normalizeArray(error)
  }

  if (!(error instanceof Error)) {
    return new Error(String(error))
  }

  if (typeof error.message !== 'string') {
    error.message = String(error)
  }

  if (typeof error.stack !== 'string') {
    Error.captureStackTrace(error, normalizeError)
  }

  return error
}

// Some libraries throw arrays of Errors
const normalizeArray = function (errorArray) {
  const [error, ...errors] = errorArray.map(normalizeError)
  error.errors = errors
  return error
}
