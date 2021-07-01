'use strict'

const { addErrorInfo } = require('../error/info')
const { setProp } = require('../utils/set')

const { getPropName } = require('./config_prop_name')
const { EVENTS } = require('./events')

// Apply a series of mutations to `netlifyConfig`.
// Also denormalize it.
const applyMutations = function (priorityConfig, configMutations) {
  return configMutations.reduce(applyMutation, priorityConfig)
}

const applyMutation = function (priorityConfig, { keys, value, event }) {
  const propName = getPropName(keys)
  if (!(propName in MUTABLE_PROPS)) {
    throwValidationError(`"netlifyConfig.${propName}" is read-only.`)
  }

  const { lastEvent, denormalize } = MUTABLE_PROPS[propName]
  validateEvent(lastEvent, event, propName)

  return denormalize === undefined ? setProp(priorityConfig, keys, value) : denormalize(priorityConfig, value)
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

// `functionsDirectory` is created by `@netlify/config`.
// We denormalize it to `functions.directory` which is user-facing.
const denormalizeFunctionsDirectory = function ({ functions, ...priorityConfig }, functionsDirectory) {
  return { ...priorityConfig, functions: { ...functions, directory: functionsDirectory } }
}

// List of properties that are not read-only.
const MUTABLE_PROPS = {
  'build.command': { lastEvent: 'onPreBuild' },
  'build.functions': { lastEvent: 'onBuild' },
  'build.publish': { lastEvent: 'onPostBuild' },
  'build.edge_handlers': { lastEvent: 'onPostBuild' },
  functionsDirectory: { lastEvent: 'onBuild', denormalize: denormalizeFunctionsDirectory },
  'functions.*': { lastEvent: 'onBuild' },
  'functions.*.*': { lastEvent: 'onBuild' },
  'functions.*.*.*': { lastEvent: 'onBuild' },
}

module.exports = { applyMutations }
