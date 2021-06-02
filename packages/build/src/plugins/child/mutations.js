'use strict'

const isPlainObj = require('is-plain-obj')
const mapObj = require('map-obj')

const { addErrorInfo } = require('../../error/info')
const { EVENTS } = require('../events')

// `netlifyConfig` is read-only except for specific properties.
// This requires a `Proxy` to warn plugin authors when mutating properties.
const preventConfigMutations = function (netlifyConfig, event) {
  const state = {}
  const topProxy = preventObjectMutations(netlifyConfig, [], { state, event })
  state.topProxy = topProxy
  return topProxy
}

// A `proxy` is recursively applied to readonly properties in `netlifyConfig`
const preventObjectMutations = function (value, keys, { state, event }) {
  const propName = keys.join('.')
  if (propName in MUTABLE_PROPS) {
    return value
  }

  if (Array.isArray(value)) {
    const array = value.map((item) => preventObjectMutations(item, [...keys, '*'], { state, event }))
    return addProxy(array, keys, { state, event })
  }

  if (isPlainObj(value)) {
    const object = mapObj(value, (key, item) => [
      key,
      preventObjectMutations(item, [...keys, getPropertyKeys(key, keys)], { state, event }),
    ])
    return addProxy(object, keys, { state, event })
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

const addProxy = function (value, keys, { state, event }) {
  // eslint-disable-next-line fp/no-proxy
  return new Proxy(value, getReadonlyProxyHandlers({ keys, state, event }))
}

// Retrieve the proxy validating function for each property
const getReadonlyProxyHandlers = function ({ keys, state, event }) {
  return {
    ...proxyHandlers,
    set: validateReadonlyProperty.bind(undefined, { method: 'set', keys, state, event }),
    defineProperty: validateReadonlyProperty.bind(undefined, { method: 'defineProperty', keys, state, event }),
    deleteProperty: validateReadonlyProperty.bind(undefined, { method: 'deleteProperty', keys, state, event }),
  }
}

// This is called when a plugin author tries to set a `netlifyConfig` property
const validateReadonlyProperty = function ({ method, keys, state: { topProxy }, event }, proxy, key, ...args) {
  const keysA = [...keys, key]
  const propName = keysA.join('.')

  if (!(propName in MUTABLE_PROPS)) {
    throwValidationError(`"netlifyConfig.${propName}" is read-only.`)
  }

  const { lastEvent, handler } = MUTABLE_PROPS[propName]

  if (EVENTS.indexOf(lastEvent) < EVENTS.indexOf(event)) {
    throwValidationError(`"netlifyConfig.${propName}" cannot be modified after "${lastEvent}".`)
  }

  if (handler !== undefined) {
    handler(topProxy, ...args)
  }

  return Reflect[method](proxy, key, ...args)
}

// When setting `build.command`, `build.commandOrigin` is set to "plugin"
const setBuildCommandOrigin = function (topProxy) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  topProxy.build.commandOrigin = 'plugin'
}

// Several configuration properties can be used to specify the functions directory.
// `netlifyConfig.functionsDirectory` is the normalized property which must be set.
// We allow plugin authors to set any of the other properties for convenience.
const setFunctionsDirectory = function (topProxy, descriptor) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  topProxy.functionsDirectory = descriptor.value
}

// List of properties that are not read-only.
const MUTABLE_PROPS = {
  'build.command': { lastEvent: 'onPreBuild', handler: setBuildCommandOrigin },
  'build.commandOrigin': { lastEvent: 'onPreBuild' },
  'build.functions': { lastEvent: 'onBuild', handler: setFunctionsDirectory },
  'build.publish': { lastEvent: 'onPostBuild' },
  'build.edge_handlers': { lastEvent: 'onPostBuild' },
  functionsDirectory: { lastEvent: 'onBuild' },
  'functions.directory': { lastEvent: 'onBuild', handler: setFunctionsDirectory },
  'functions.*.directory': { lastEvent: 'onBuild', handler: setFunctionsDirectory },
  'functions.*.external_node_modules': { lastEvent: 'onBuild' },
  'functions.*.ignored_node_modules': { lastEvent: 'onBuild' },
  'functions.*.included_files': { lastEvent: 'onBuild' },
  'functions.*.node_bundler': { lastEvent: 'onBuild' },
}

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
