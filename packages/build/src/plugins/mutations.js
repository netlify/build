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
  'build.edge_handlers': { lastEvent: 'onPostBuild' },
  'build.functions': { lastEvent: 'onBuild' },
  'build.processing': { lastEvent: 'onPostBuild' },
  'build.processing.css': { lastEvent: 'onPostBuild' },
  'build.processing.css.bundle': { lastEvent: 'onPostBuild' },
  'build.processing.css.minify': { lastEvent: 'onPostBuild' },
  'build.processing.html': { lastEvent: 'onPostBuild' },
  'build.processing.html.pretty_urls': { lastEvent: 'onPostBuild' },
  'build.processing.images': { lastEvent: 'onPostBuild' },
  'build.processing.images.compress': { lastEvent: 'onPostBuild' },
  'build.processing.js': { lastEvent: 'onPostBuild' },
  'build.processing.js.bundle': { lastEvent: 'onPostBuild' },
  'build.processing.js.minify': { lastEvent: 'onPostBuild' },
  'build.processing.skip_processing': { lastEvent: 'onPostBuild' },
  'build.publish': { lastEvent: 'onPostBuild' },
  'build.services': { lastEvent: 'onPostBuild' },
  'build.services.*': { lastEvent: 'onPostBuild' },
  functionsDirectory: { lastEvent: 'onBuild', denormalize: denormalizeFunctionsDirectory },
  'functions.*': { lastEvent: 'onBuild' },
  'functions.*.*': { lastEvent: 'onBuild' },
  redirects: { lastEvent: 'onPostBuild' },
}

module.exports = { applyMutations }
