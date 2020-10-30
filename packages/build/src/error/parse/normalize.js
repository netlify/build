'use strict'

// Ensure error is an `Error` instance
const normalizeError = function (error) {
  if (Array.isArray(error)) {
    return normalizeArray(error)
  }

  if (error instanceof Error && typeof error.message === 'string' && typeof error.stack === 'string') {
    return error
  }

  return new Error(String(error))
}

// Some libraries throw arrays of Errors
const normalizeArray = function (errorArray) {
  const [error, ...errors] = errorArray.map(normalizeError)
  error.errors = errors
  return error
}

module.exports = { normalizeError }
