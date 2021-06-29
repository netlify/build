'use strict'

const { set } = require('dot-prop')

const { addErrorInfo } = require('../error/info')

const { getPropName } = require('./config_prop_name')
const { EVENTS } = require('./events')

// Apply a series of mutations to `netlifyConfig`.
// Also normalize it.
const applyMutations = function (priorityConfig, configMutations) {
  configMutations.forEach(({ keys, value, event }) => {
    applyMutation({ priorityConfig, keys, value, event })
  })
  return priorityConfig
}

const applyMutation = function ({ priorityConfig, keys, value, event }) {
  const keysString = serializeKeys(keys)
  const propName = getPropName(keys)
  if (!(propName in MUTABLE_PROPS)) {
    throwValidationError(`"netlifyConfig.${propName}" is read-only.`)
  }

  const { lastEvent, handler } = MUTABLE_PROPS[propName]
  validateEvent(lastEvent, event, propName)

  set(priorityConfig, keysString, value)

  if (handler !== undefined) {
    handler(priorityConfig, value, keys)
  }
}

const validateEvent = function (lastEvent, event, propName) {
  if (EVENTS.indexOf(lastEvent) < EVENTS.indexOf(event)) {
    throwValidationError(`"netlifyConfig.${propName}" cannot be modified after "${lastEvent}".`)
  }
}

const throwValidationError = function (message) {
  const error = new Error(message)
  addErrorInfo(error, { type: 'pluginValidation' })
  throw error
}

const serializeKeys = function (keys) {
  return keys.map(String).join('.')
}

// When setting `build.command`, `build.commandOrigin` is set to "plugin"
const setBuildCommandOrigin = function (priorityConfig) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  priorityConfig.build.commandOrigin = 'plugin'
}

const setTopFunctionsDirectory = function (priorityConfig, value, keys) {
  setFunctionsDirectory(priorityConfig, value)
  setFunctionsCatchAll(priorityConfig, value, keys)
}

// When settings `functions.{propName}`, we also set `functions.*.{propName}`,
// emulating the normalization performed by `@netlify/config`.
const setFunctionsCatchAll = function (priorityConfig, value, keys) {
  const lastKey = keys[keys.length - 1]
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  priorityConfig.functions['*'][lastKey] = value
}

// Several configuration properties can be used to specify the functions directory.
// `netlifyConfig.functionsDirectory` is the normalized property which must be set.
// We allow plugin authors to set any of the other properties for convenience.
const setFunctionsDirectory = function (priorityConfig, value) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  priorityConfig.functionsDirectory = value
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

module.exports = { applyMutations }
