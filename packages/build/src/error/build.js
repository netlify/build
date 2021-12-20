import safeJsonStringify from 'safe-json-stringify'

import { CUSTOM_ERROR_KEY } from './info.js'

// Retrieve error information from child process and re-build it in current
// process. We need this since errors static properties are not kept by
// `v8.serialize()`.
export const jsonToError = function ({ name, message, stack, ...errorProps }) {
  // eslint-disable-next-line unicorn/error-message
  const error = new Error('')

  assignErrorProps(error, { name, message, stack })
  // Assign static error properties (if any)
  // We need to mutate the `error` directly to preserve its `name`, `stack`, etc.
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(error, errorProps)

  return error
}

// Make sure `name`, `message` and `stack` are not enumerable
const assignErrorProps = function (error, values) {
  ERROR_PROPS.forEach((name) => {
    assignErrorProp(error, name, values[name])
  })
}

const ERROR_PROPS = ['name', 'message', 'stack']

const assignErrorProp = function (error, name, value) {
  // `Object.defineProperty()` requires direct mutation
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, name, { value, enumerable: false, writable: true, configurable: true })
}

// Inverse of `jsonToError()`.
export const errorToJson = function ({ name, message, stack, [CUSTOM_ERROR_KEY]: customError, ...errorProps }) {
  return {
    ...safeJsonStringify.ensureProperties(errorProps),
    ...safeJsonStringify.ensureProperties({ name, message, stack, [CUSTOM_ERROR_KEY]: customError }),
  }
}
