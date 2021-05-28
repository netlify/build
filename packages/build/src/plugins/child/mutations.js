'use strict'

const isPlainObj = require('is-plain-obj')
const mapObj = require('map-obj')

const { addErrorInfo } = require('../../error/info')

// `netlifyConfig` is read-only except for specific properties.
// This requires a `Proxy` to warn plugin authors when mutating properties.
const preventConfigMutations = function (netlifyConfig) {
  const state = {}
  const topProxy = preventObjectMutations(netlifyConfig, [], state)
  state.topProxy = topProxy
  return topProxy
}

// A `proxy` is recursively applied to readonly properties in `netlifyConfig`
const preventObjectMutations = function (value, keys, state) {
  if (isMutable(keys)) {
    return value
  }

  if (Array.isArray(value)) {
    const array = value.map((item) => preventObjectMutations(item, [...keys, '*'], state))
    return addProxy(array, keys, state)
  }

  if (isPlainObj(value)) {
    const object = mapObj(value, (key, item) => [
      key,
      preventObjectMutations(item, [...keys, getPropertyKeys(key, keys)], state),
    ])
    return addProxy(object, keys, state)
  }

  return value
}

// Retrieve the path of a property while recursing
const getPropertyKeys = function (key, keys) {
  const parentKey = keys[keys.length - 1]
  return DYNAMIC_OBJECT_PROPS.has(parentKey) ? '*' : key
}

// Some properties are user-defined, i.e. we need to replace them with a "*" token
const DYNAMIC_OBJECT_PROPS = new Set(['functions'])

const addProxy = function (value, keys, state) {
  // eslint-disable-next-line fp/no-proxy
  return new Proxy(value, getReadonlyProxyHandlers(keys, state))
}

// Retrieve the proxy validating function for each property
const getReadonlyProxyHandlers = function (keys, state) {
  return {
    ...proxyHandlers,
    set: validateReadonlyProperty.bind(undefined, 'set', keys, state),
    defineProperty: validateReadonlyProperty.bind(undefined, 'defineProperty', keys, state),
    deleteProperty: validateReadonlyProperty.bind(undefined, 'deleteProperty', keys, state),
  }
}

// This is called when a plugin author tries to set a `netlifyConfig` property
// eslint-disable-next-line max-params
const validateReadonlyProperty = function (method, keys, { topProxy }, proxy, key, ...args) {
  const keysA = [...keys, key]
  const propName = keysA.join('.')

  callPropertySpecificLogic(propName, topProxy, ...args)

  if (isMutable(keysA)) {
    return Reflect[method](proxy, key, ...args)
  }

  throwValidationError(`"netlifyConfig.${propName}" is read-only.`)
}

// Property-specific handlers for additional logic when they are being set
const callPropertySpecificLogic = function (propName, topProxy, ...args) {
  const propertySpecificLogic = PROPERTY_SPECIFIC_LOGIC[propName]
  if (propertySpecificLogic === undefined) {
    return
  }

  propertySpecificLogic(topProxy, ...args)
}

// Several configuration properties can be used to specify the functions directory.
// `netlifyConfig.functionsDirectory` is the normalized property which must be set.
// We allow plugin authors to set any of the other properties for convenience.
const setFunctionsDirectory = function (topProxy, descriptor) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  topProxy.functionsDirectory = descriptor.value
}

const PROPERTY_SPECIFIC_LOGIC = {
  'build.functions': setFunctionsDirectory,
  'functions.directory': setFunctionsDirectory,
  'functions.*.directory': setFunctionsDirectory,
}

const isMutable = function (keys) {
  return MUTABLE_KEYS.has(keys.join('.'))
}

// List of properties that are not read-only
const MUTABLE_KEYS = new Set([
  'build.functions',
  'build.publish',
  'build.edge_handlers',
  'functionsDirectory',
  'functions.directory',
  'functions.*.directory',
  'functions.*.external_node_modules',
  'functions.*.ignored_node_modules',
  'functions.*.included_files',
  'functions.*.node_bundler',
])

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
