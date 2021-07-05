'use strict'

// We distinguish between errors thrown intentionally and uncaught exceptions
// (such as bugs) with a `type` property.
const throwUserError = function (messageOrError, error) {
  const errorA = getError(messageOrError, error)
  errorA.type = USER_ERROR_TYPE
  throw errorA
}

const throwConfigMutationError = function (messageOrError, error) {
  const errorA = getError(messageOrError, error)
  errorA.type = CONFIG_MUTATION_ERROR_TYPE
  throw errorA
}

// Can pass either `message`, `error` or `message, error`
const getError = function (messageOrError, error) {
  if (messageOrError instanceof Error) {
    return messageOrError
  }

  if (error === undefined) {
    return new Error(messageOrError)
  }

  error.message = `${messageOrError}\n${error.message}`
  return error
}

// Check `error.type`
const isUserError = function (error) {
  return error instanceof Error && NON_SYSTEM_ERROR_TYPES.has(error.type)
}

const USER_ERROR_TYPE = 'userError'
const CONFIG_MUTATION_ERROR_TYPE = 'configMutation'
const NON_SYSTEM_ERROR_TYPES = new Set([USER_ERROR_TYPE, CONFIG_MUTATION_ERROR_TYPE])

module.exports = { throwUserError, throwConfigMutationError, isUserError }
