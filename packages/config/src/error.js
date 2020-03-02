// We distinguish between errors thrown intentionally and uncaught exceptions
// (such as bugs) with a `type` property.
const throwError = function(messageOrError, error) {
  const errorA = getError(messageOrError, error)
  errorA.type = ERROR_TYPE
  throw errorA
}

// Can pass either `message`, `error` or `message, error`
const getError = function(messageOrError, error) {
  if (messageOrError instanceof Error) {
    return messageOrError
  }

  if (error === undefined) {
    return new Error(messageOrError)
  }

  error.message = `${messageOrError}\n${error.message}`
  return error
}

// Add the configuration file path to the error messages
const addConfigPath = function(error, configPath) {
  if (error.type !== ERROR_TYPE) {
    throw error
  }

  error.message = `When resolving config file ${configPath}:\n${error.message}`
  throw error
}

const ERROR_TYPE = 'userError'

module.exports = { throwError, addConfigPath }
