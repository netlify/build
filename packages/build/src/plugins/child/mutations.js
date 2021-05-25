'use strict'

const isPlainObj = require('is-plain-obj')
const mapObj = require('map-obj')

const { addErrorInfo } = require('../../error/info')

// `netlifyConfig` is read-only except for specific properties.
// This requires a `Proxy` to warn plugin authors when mutating properties.
const preventConfigMutations = function (netlifyConfig) {
  return preventObjectMutations(netlifyConfig, [])
}

// A `proxy` is recursively applied to readonly properties in `netlifyConfig`
const preventObjectMutations = function (value, keys) {
  if (isMutable(keys)) {
    return value
  }

  if (Array.isArray(value)) {
    const array = value.map((item) => preventObjectMutations(item, [...keys, '*']))
    return addProxy(array, keys)
  }

  if (isPlainObj(value)) {
    const object = mapObj(value, (key, item) => [key, preventObjectMutations(item, [...keys, key])])
    return addProxy(object, keys)
  }

  return value
}

const addProxy = function (value, keys) {
  // eslint-disable-next-line fp/no-proxy
  return new Proxy(value, getReadonlyProxyHandlers(keys))
}

// Retrieve the proxy validating function for each property
const getReadonlyProxyHandlers = function (keys) {
  return {
    ...proxyHandlers,
    set: validateReadonlyProperty.bind(undefined, 'set', keys),
    defineProperty: validateReadonlyProperty.bind(undefined, 'defineProperty', keys),
    deleteProperty: validateReadonlyProperty.bind(undefined, 'deleteProperty', keys),
  }
}

// This is called when a plugin author tries to set a `netlifyConfig` property
// eslint-disable-next-line max-params
const validateReadonlyProperty = function (method, keys, proxy, key, ...args) {
  const keysA = [...keys, key]
  if (isMutable(keysA)) {
    return Reflect[method](proxy, key, ...args)
  }

  const propName = keysA.join('.')
  throwValidationError(`"netlifyConfig.${propName}" is read-only.`)
}

const isMutable = function (keys) {
  return MUTABLE_KEYS.has(keys.join('.'))
}

// List of properties that are not read-only
const MUTABLE_KEYS = new Set([])

const validateAnyProperty = function (method) {
  throwValidationError(`Using the "${method}()" method on "netlifyConfig" is not allowed.`)
}

// Using those exotic methods is never allowed
const proxyHandlers = {
  preventExtensions: validateAnyProperty.bind(undefined, 'validateAnyProperty'),
  setPrototypeOf: validateAnyProperty.bind(undefined, 'setPrototypeOf'),
}

const throwValidationError = function (message) {
  const error = new Error(message)
  addErrorInfo(error, { type: 'pluginValidation' })
  throw error
}

module.exports = { preventConfigMutations }
