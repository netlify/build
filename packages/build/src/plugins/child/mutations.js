/* eslint-disable max-lines */
'use strict'

const { set } = require('dot-prop')
const isPlainObj = require('is-plain-obj')
const mapObj = require('map-obj')

const { addErrorInfo } = require('../../error/info')
const { logConfigMutation } = require('../../log/messages/plugins')
const { EVENTS } = require('../events')

// `netlifyConfig` is read-only except for specific properties.
// This requires a `Proxy` to:
//  - Log the change on the console
//  - Keep track of the changes so they can be processed later to:
//     - Warn plugin authors when mutating read-only properties
//     - Apply the change to `netlifyConfig` in the parent process so it can
//       run `@netlify/config` to normalize and validate the new values
const trackConfigMutations = function (netlifyConfig, configMutations, event) {
  return trackObjectMutations(netlifyConfig, [], { configMutations, event })
}

// A `proxy` is recursively applied to readonly properties in `netlifyConfig`
const trackObjectMutations = function (value, keys, { configMutations, event }) {
  if (PROXIES.has(value)) {
    return value
  }

  if (Array.isArray(value)) {
    const array = value.map((item, index) =>
      trackObjectMutations(item, [...keys, String(index)], { configMutations, event }),
    )
    return addProxy(array, keys, { configMutations, event })
  }

  if (isPlainObj(value)) {
    const object = mapObj(value, (key, item) => [
      key,
      trackObjectMutations(item, [...keys, key], { configMutations, event }),
    ])
    return addProxy(object, keys, { configMutations, event })
  }

  return value
}

// Inverse of `preventObjectMutations()`
const removeProxies = function (value) {
  if (!PROXIES.has(value)) {
    return value
  }

  const originalValue = PROXIES.get(value)
  if (Array.isArray(originalValue)) {
    return originalValue.map(removeProxies)
  }

  if (isPlainObj(originalValue)) {
    return mapObj(value, (key, item) => [key, removeProxies(item)])
  }

  return originalValue
}

const addProxy = function (value, keys, { configMutations, event }) {
  // eslint-disable-next-line fp/no-proxy
  const proxy = new Proxy(value, {
    preventExtensions: forbidMethod.bind(undefined, keys, 'validateAnyProperty'),
    setPrototypeOf: forbidMethod.bind(undefined, keys, 'setPrototypeOf'),
    deleteProperty: forbidDelete.bind(undefined, keys),
    defineProperty: trackDefineProperty.bind(undefined, { parentKeys: keys, configMutations, event }),
  })
  PROXIES.set(proxy, value)
  return proxy
}

// Triggered when calling either
// `Object.defineProperty(netlifyConfig, key, { value })` or
// `netlifyConfig.{key} = value`
// New values are wrapped in a `Proxy` to listen for changes on them as well.
const trackDefineProperty = function (
  { parentKeys, configMutations, event },
  proxy,
  lastKey,
  { value, ...descriptor },
) {
  const keys = [...parentKeys, lastKey]
  const proxyDescriptor = {
    ...descriptor,
    value: trackObjectMutations(value, keys, { configMutations, event }),
  }
  const propName = getPropName(keys)
  // eslint-disable-next-line fp/no-mutating-methods
  configMutations.push({ keys, propName, value, event })
  logConfigMutation(propName, value)
  return Reflect.defineProperty(proxy, lastKey, proxyDescriptor)
}

// Retrieve normalized property name
const getPropName = function (keys) {
  return serializeKeys(keys.map(normalizeDynamicProp))
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

// When setting `build.command`, `build.commandOrigin` is set to "plugin"
const setBuildCommandOrigin = function (netlifyConfig) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  netlifyConfig.build.commandOrigin = 'plugin'
}

const setTopFunctionsDirectory = function (netlifyConfig, value, keys) {
  setFunctionsDirectory(netlifyConfig, value)
  setFunctionsCatchAll(netlifyConfig, value, keys)
}

// When settings `functions.{propName}`, we also set `functions.*.{propName}`,
// emulating the normalization performed by `@netlify/config`.
const setFunctionsCatchAll = function (netlifyConfig, value, keys) {
  const lastKey = keys[keys.length - 1]
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  netlifyConfig.functions['*'][lastKey] = value
}

// Several configuration properties can be used to specify the functions directory.
// `netlifyConfig.functionsDirectory` is the normalized property which must be set.
// We allow plugin authors to set any of the other properties for convenience.
const setFunctionsDirectory = function (netlifyConfig, value) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  netlifyConfig.functionsDirectory = value
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

// Triggered when calling `delete netlifyConfig.{key}`
// We do not allow this because the back-end
// only receives mutations as a `netlify.toml`, i.e. cannot apply property
// deletions since `undefined` is not serializable in TOML.
const forbidDelete = function (keys, proxy, key) {
  const propName = getPropName([...keys, key])
  throwValidationError(`Deleting "netlifyConfig.${propName}" is not allowed.
Please set this property to a specific value instead.`)
}

// Triggered when calling `netlifyConfig.{key} = undefined | null`
const forbidEmptyAssign = function (value, propName) {
  if (value === undefined || value === null) {
    throwValidationError(`Setting "netlifyConfig.${propName}" to ${value} is not allowed.
Please set this property to a specific value instead.`)
  }
}

const forbidMethod = function (keys, method) {
  const propName = getPropName(keys)
  throwValidationError(`Using the "${method}()" method on "netlifyConfig.${propName}" is not allowed.`)
}

// Keep track of all config `Proxy` so that we can avoid wrapping a value twice
// in a `Proxy`
const PROXIES = new WeakMap()

const throwValidationError = function (message) {
  const error = new Error(message)
  addErrorInfo(error, { type: 'pluginValidation' })
  throw error
}

const applyMutations = function (netlifyConfig, configMutations) {
  configMutations.forEach(({ keys, propName, value, event }) => {
    applyMutation({ netlifyConfig, keys, propName, value, event })
  })
}

// Apply all proxy mutations to the original `netlifyConfig`. Also normalize it.
const applyMutation = function ({ netlifyConfig, keys, propName, value, event }) {
  const originalValue = removeProxies(value)
  set(netlifyConfig, serializeKeys(keys), originalValue)
  validateMutation({ propName, originalValue, event })
  triggerHandler({ netlifyConfig, keys, propName, originalValue })
}

const validateMutation = function ({ propName, originalValue, event }) {
  forbidEmptyAssign(originalValue, propName)

  if (!(propName in MUTABLE_PROPS)) {
    throwValidationError(`"netlifyConfig.${propName}" is read-only.`)
  }

  const { lastEvent } = MUTABLE_PROPS[propName]

  if (EVENTS.indexOf(lastEvent) < EVENTS.indexOf(event)) {
    throwValidationError(`"netlifyConfig.${propName}" cannot be modified after "${lastEvent}".`)
  }
}

const triggerHandler = function ({ netlifyConfig, keys, propName, originalValue }) {
  const { handler } = MUTABLE_PROPS[propName]
  if (handler === undefined) {
    return
  }

  handler(netlifyConfig, originalValue, keys)
}

module.exports = { trackConfigMutations, applyMutations }
/* eslint-enable max-lines */
