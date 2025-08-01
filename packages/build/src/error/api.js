import isPlainObj from 'is-plain-obj'

import { addErrorInfo } from './info.js'

// Wrap `api.*` methods so that they add more error information
export const addApiErrorHandlers = function (api) {
  if (api === undefined) {
    return
  }

  return Object.fromEntries(Object.entries(api).map(addErrorHandler))
}

const addErrorHandler = function ([key, value]) {
  if (typeof value !== 'function') {
    return [key, value]
  }

  const valueA = apiMethodHandler.bind(null, key, value)
  return [key, valueA]
}

const apiMethodHandler = async function (endpoint, method, parameters, ...args) {
  try {
    return await method(parameters, ...args)
  } catch (error) {
    redactError(error)
    addErrorInfo(error, { type: 'api', location: { endpoint, parameters } })
    throw error
  }
}

// Redact API token from the build logs
const redactError = function (error) {
  if (
    error instanceof Error &&
    isPlainObj(error.data) &&
    isPlainObj(error.data.headers) &&
    typeof error.data.headers.Authorization === 'string'
  ) {
    error.data.headers.Authorization = error.data.headers.Authorization.replace(HEX_REGEXP, 'HEX')
  }
}

const HEX_REGEXP = /[\da-f]{6,}/g
