/* eslint-disable max-lines */
'use strict'

const isPlainObj = require('is-plain-obj')
const mapObj = require('map-obj')

const { addErrorInfo } = require('../../error/info')
const { logConfigMutation } = require('../../log/messages/plugins')
const { EVENTS } = require('../events')

// `netlifyConfig` is read-only except for specific properties.
// This requires a `Proxy` to:
//  - Warn plugin authors when mutating read-only properties
//  - Execute custom logic, e.g. setting normalized properties when denormalized
//    ones are being modified
const preventConfigMutations = function (netlifyConfig, event) {
  const state = { ongoingMutation: false }
  const topProxy = preventObjectMutations(netlifyConfig, [], { state, event })
  state.topProxy = topProxy
  return topProxy
}

// A `proxy` is recursively applied to readonly properties in `netlifyConfig`
const preventObjectMutations = function (value, keys, { state, event }) {
  if (PROXIES.has(value)) {
    return value
  }

  if (Array.isArray(value)) {
    const array = value.map((item, index) => preventObjectMutations(item, [...keys, String(index)], { state, event }))
    return addProxy(array, keys, { state, event })
  }

  if (isPlainObj(value)) {
    const object = mapObj(value, (key, item) => [key, preventObjectMutations(item, [...keys, key], { state, event })])
    return addProxy(object, keys, { state, event })
  }

  return value
}

const addProxy = function (value, keys, { state, event }) {
  // eslint-disable-next-line fp/no-proxy
  const proxy = new Proxy(value, getReadonlyProxyHandlers({ keys, state, event }))
  PROXIES.add(proxy)
  return proxy
}

// Retrieve the proxy validating function for each property
const getReadonlyProxyHandlers = function ({ keys, state, event }) {
  return {
    ...proxyHandlers,
    set: validateSet.bind(undefined, { keys, state, event }),
    defineProperty: validateDefineProperty.bind(undefined, { keys, state, event }),
    deleteProperty: validateDelete.bind(undefined, { keys, state, event }),
  }
}

// Triggered when calling `netlifyConfig.{key} = value`
// eslint-disable-next-line max-params
const validateSet = function ({ keys, state, event }, proxy, key, value, receiver) {
  const valueA = preventObjectMutations(value, [...keys, key], { state, event })
  return validateReadonlyProperty({
    method: 'set',
    keys,
    key,
    value: valueA,
    state,
    event,
    reflectArgs: [proxy, key, valueA, receiver],
  })
}

// Triggered when calling `Object.defineProperty(netlifyConfig, key, { value })`
const validateDefineProperty = function ({ keys, state, event }, proxy, key, descriptor) {
  const valueA = preventObjectMutations(descriptor.value, [...keys, key], { state, event })
  const descriptorA = { ...descriptor, value: valueA }
  return validateReadonlyProperty({
    method: 'defineProperty',
    keys,
    key,
    value: valueA,
    state,
    event,
    reflectArgs: [proxy, key, descriptorA],
  })
}

// Triggered when calling `delete netlifyConfig.{key}`
const validateDelete = function ({ keys, state, event }, proxy, key) {
  return validateReadonlyProperty({
    method: 'deleteProperty',
    keys,
    key,
    value: undefined,
    state,
    event,
    reflectArgs: [proxy, key],
  })
}

// This is called when a plugin author tries to set a `netlifyConfig` property
const validateReadonlyProperty = function ({
  method,
  keys,
  key,
  value,
  state,
  state: { topProxy, ongoingMutation },
  event,
  reflectArgs,
}) {
  const propName = getPropName(keys, key)

  if (!(propName in MUTABLE_PROPS)) {
    throwValidationError(`"netlifyConfig.${propName}" is read-only.`)
  }

  const { lastEvent, handler } = MUTABLE_PROPS[propName]

  if (EVENTS.indexOf(lastEvent) < EVENTS.indexOf(event)) {
    throwValidationError(`"netlifyConfig.${propName}" cannot be modified after "${lastEvent}".`)
  }

  startLogConfigMutation({ state, ongoingMutation, value, propName })

  try {
    if (handler !== undefined) {
      handler(topProxy, value, key)
    }

    return Reflect[method](...reflectArgs)
  } finally {
    stopLogConfigMutation(state, ongoingMutation)
  }
}

// Retrieve normalized property name
const getPropName = function (keys, key) {
  return serializeKeys([...keys, key].map(normalizeDynamicProp))
}

// Some properties are user-defined, i.e. we need to replace them with a "*" token
const normalizeDynamicProp = function (key, index, keys) {
  return isArrayItem(key) || isDynamicObjectProp(keys, index) ? '*' : key
}

// Check it the value is a value item. In that case, we replace its indice by "*"
const isArrayItem = function (key) {
  return typeof key !== 'symbol' && Number.isInteger(Number(key))
}

// Check if a property name is dynamic, such as `functions.{functionName}`
const isDynamicObjectProp = function (keys, index) {
  return (
    index !== 0 &&
    DYNAMIC_OBJECT_PROPS.has(serializeKeys(keys.slice(0, index))) &&
    !NON_DYNAMIC_OBJECT_PROPS.has(serializeKeys(keys.slice(0, index + 1)))
  )
}

// Properties with dynamic children
const DYNAMIC_OBJECT_PROPS = new Set(['functions'])
// Children properties which should not be considered dynamic
const NON_DYNAMIC_OBJECT_PROPS = new Set([
  'functions.directory',
  'functions.external_node_modules',
  'functions.ignored_node_modules',
  'functions.included_files',
  'functions.node_bundler',
])

const serializeKeys = function (keys) {
  return keys.map(String).join('.')
}

// Mutating a property often mutates others because:
//  - Proxy handlers trigger each other, e.g. `set` triggers `defineProperty`
//  - The `handler()` function might set another property
// We only want to print the top-level mutation since this is the user-facing
// one. Therefore, we keep track of whether a `Proxy` mutation is ongoing.
const startLogConfigMutation = function ({ state, ongoingMutation, value, propName }) {
  if (ongoingMutation) {
    return
  }

  state.ongoingMutation = true
  logConfigMutation(propName, value)
}

const stopLogConfigMutation = function (state, ongoingMutation) {
  if (ongoingMutation) {
    return
  }

  state.ongoingMutation = false
}

// When setting `build.command`, `build.commandOrigin` is set to "plugin"
const setBuildCommandOrigin = function (topProxy) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  topProxy.build.commandOrigin = 'plugin'
}

const setTopFunctionsDirectory = function (topProxy, value, key) {
  setFunctionsDirectory(topProxy, value)
  setFunctionsCatchAll(topProxy, value, key)
}

// When settings `functions.{propName}`, we also set `functions.*.{propName}`,
// emulating the normalization performed by `@netlify/config`.
const setFunctionsCatchAll = function (topProxy, value, key) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  topProxy.functions['*'][key] = value
}

// Several configuration properties can be used to specify the functions directory.
// `netlifyConfig.functionsDirectory` is the normalized property which must be set.
// We allow plugin authors to set any of the other properties for convenience.
const setFunctionsDirectory = function (topProxy, value) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  topProxy.functionsDirectory = value
}

// List of properties that are not read-only.
const MUTABLE_PROPS = {
  'build.command': { lastEvent: 'onPreBuild', handler: setBuildCommandOrigin },
  'build.commandOrigin': { lastEvent: 'onPreBuild' },
  'build.functions': { lastEvent: 'onBuild', handler: setFunctionsDirectory },
  'build.publish': { lastEvent: 'onPostBuild' },
  'build.edge_handlers': { lastEvent: 'onPostBuild' },
  functionsDirectory: { lastEvent: 'onBuild' },
  'functions.*': { lastEvent: 'onBuild' },
  'functions.directory': { lastEvent: 'onBuild', handler: setTopFunctionsDirectory },
  'functions.external_node_modules': { lastEvent: 'onBuild', handler: setFunctionsCatchAll },
  'functions.ignored_node_modules': { lastEvent: 'onBuild', handler: setFunctionsCatchAll },
  'functions.included_files': { lastEvent: 'onBuild', handler: setFunctionsCatchAll },
  'functions.node_bundler': { lastEvent: 'onBuild', handler: setFunctionsCatchAll },
  'functions.*.directory': { lastEvent: 'onBuild', handler: setFunctionsDirectory },
  'functions.*.external_node_modules': { lastEvent: 'onBuild' },
  'functions.*.external_node_modules.*': { lastEvent: 'onBuild' },
  'functions.*.ignored_node_modules': { lastEvent: 'onBuild' },
  'functions.*.ignored_node_modules.*': { lastEvent: 'onBuild' },
  'functions.*.included_files': { lastEvent: 'onBuild' },
  'functions.*.included_files.*': { lastEvent: 'onBuild' },
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

// Keep track of all config `Proxy` so that we can avoid wrapping a value twice
// in a `Proxy`
const PROXIES = new WeakSet()

const throwValidationError = function (message) {
  const error = new Error(message)
  addErrorInfo(error, { type: 'pluginValidation' })
  throw error
}

module.exports = { preventConfigMutations }
/* eslint-enable max-lines */
