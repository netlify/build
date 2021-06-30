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

  const { lastEvent, denormalize } = MUTABLE_PROPS[propName]
  validateEvent(lastEvent, event, propName)

  if (denormalize === undefined) {
    set(priorityConfig, keysString, value)
  } else {
    denormalize(priorityConfig, value)
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

// `functionsDirectory` is created by `@netlify/config`.
// We denormalize it to `functions.directory` which is user-facing.
const denormalizeFunctionsDirectory = function (priorityConfig, functionsDirectory) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  priorityConfig.functions = priorityConfig.functions || {}
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  priorityConfig.functions.directory = functionsDirectory
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
