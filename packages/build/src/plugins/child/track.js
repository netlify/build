'use strict'

const isPlainObj = require('is-plain-obj')
const mapObj = require('map-obj')

const { addErrorInfo } = require('../../error/info')
const { logConfigMutation } = require('../../log/messages/plugins')

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
    const array = value.map((item, index) => trackObjectMutations(item, [...keys, index], { configMutations, event }))
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

const addProxy = function (value, keys, { configMutations, event }) {
  // eslint-disable-next-line fp/no-proxy
  const proxy = new Proxy(value, {
    deleteProperty: forbidDelete.bind(undefined, keys),
    preventExtensions: forbidMethod.bind(undefined, keys, 'validateAnyProperty'),
    setPrototypeOf: forbidMethod.bind(undefined, keys, 'setPrototypeOf'),
    defineProperty: trackDefineProperty.bind(undefined, { parentKeys: keys, configMutations, event }),
  })
  PROXIES.set(proxy, value)
  return proxy
}

// Triggered when calling `delete netlifyConfig.{key}`
// We do not allow this because the back-end
// only receives mutations as a `netlify.toml`, i.e. cannot apply property
// deletions since `undefined` is not serializable in TOML.
const forbidDelete = function (keys, proxy, key) {
  const keysString = serializeKeys([...keys, key])
  throwValidationError(`Deleting "netlifyConfig.${keysString}" is not allowed.
Please set this property to a specific value instead.`)
}

const forbidMethod = function (keys, method) {
  const keysString = serializeKeys(keys)
  throwValidationError(`Using the "${method}()" method on "netlifyConfig.${keysString}" is not allowed.`)
}

// Triggered when calling either
// `Object.defineProperty(netlifyConfig, key, { value })` or
// `netlifyConfig.{key} = value`
// New values are wrapped in a `Proxy` to listen for changes on them as well.
const trackDefineProperty = function ({ parentKeys, configMutations, event }, proxy, key, { value, ...descriptor }) {
  const keys = [...parentKeys, key]
  const keysString = serializeKeys(keys)
  const jsonKeys = keys.map(jsonNormalizeKey)

  forbidArrayElementAssign(key, keysString)
  forbidEmptyAssign(value, keysString)

  const proxyDescriptor = {
    ...descriptor,
    value: trackObjectMutations(value, keys, { configMutations, event }),
  }
  // eslint-disable-next-line fp/no-mutating-methods
  configMutations.push({ keys: jsonKeys, value, event })
  logConfigMutation(keysString, value)
  return Reflect.defineProperty(proxy, key, proxyDescriptor)
}

const serializeKeys = function (keys) {
  return keys.map(String).join('.')
}

// `configMutations` is passed to parent process as JSON
const jsonNormalizeKey = function (key) {
  return typeof key === 'symbol' ? String(key) : key
}

const forbidArrayElementAssign = function (key, keyString) {
  const index = typeof key === 'string' ? Number(key) : key
  if (Number.isInteger(index)) {
    throwValidationError(`Setting "netlifyConfig.${keyString}" individual array element is not allowed.
Please set the full array instead.`)
  }
}

// Triggered when calling `netlifyConfig.{key} = undefined | null`
const forbidEmptyAssign = function (value, keysString) {
  if (value === undefined || value === null) {
    throwValidationError(`Setting "netlifyConfig.${keysString}" to ${value} is not allowed.
Please set this property to a specific value instead.`)
  }
}

const throwValidationError = function (message) {
  const error = new Error(message)
  addErrorInfo(error, { type: 'pluginValidation' })
  throw error
}

// Keep track of all config `Proxy` so that we can avoid wrapping a value twice
// in a `Proxy`
const PROXIES = new WeakMap()

module.exports = { trackConfigMutations }
