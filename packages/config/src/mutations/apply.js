'use strict'

const { throwUserError } = require('../error')
const { EVENTS } = require('../events')
const { WILDCARD_ALL, FUNCTION_LIKE_CONFIG_PROPERTIES } = require('../functions_config')
const { setProp } = require('../utils/set')

const { getPropName } = require('./config_prop_name')

// Apply a series of mutations to `inlineConfig`.
// Meant to be used to apply configuration changes at build time.
// Those are applied on the `inlineConfig` object after `@netlify/config`
// normalization. Therefore, this function also denormalizes (reverts that
// normalization) so that the final `config` object can be serialized back to
// a `netlify.toml`.
const applyMutations = function (inlineConfig, configMutations) {
  return configMutations.reduce(applyMutation, inlineConfig)
}

const applyMutation = function (inlineConfig, { keys, value, event }) {
  const propName = getPropName(keys)
  if (!(propName in MUTABLE_PROPS)) {
    throwUserError(`"netlifyConfig.${propName}" is read-only.`)
  }

  const { lastEvent, denormalize } = MUTABLE_PROPS[propName]
  validateEvent(lastEvent, event, propName)

  return denormalize === undefined ? setProp(inlineConfig, keys, value) : denormalize(inlineConfig, value, keys)
}

const validateEvent = function (lastEvent, event, propName) {
  if (EVENTS.indexOf(lastEvent) < EVENTS.indexOf(event)) {
    throwUserError(`"netlifyConfig.${propName}" cannot be modified after "${lastEvent}".`)
  }
}

// `functions|builders['*'].*` has higher priority than `functions|builders.*`
// so we convert the latter to the former.
const denormalizeFunctionLikeTopProps = function (
  propName,
  { [propName]: props, [propName]: { [WILDCARD_ALL]: wildcardProps } = {}, ...inlineConfig },
  value,
  [, key],
) {
  return FUNCTION_LIKE_CONFIG_PROPERTIES.has(key)
    ? {
        ...inlineConfig,
        [propName]: { ...props, [WILDCARD_ALL]: { ...wildcardProps, [key]: value } },
      }
    : { ...inlineConfig, [propName]: { ...props, [key]: value } }
}

// List of properties that are not read-only.
const MUTABLE_PROPS = {
  'build.command': { lastEvent: 'onPreBuild' },
  'build.edge_handlers': { lastEvent: 'onPostBuild' },
  'build.environment': { lastEvent: 'onPostBuild' },
  'build.environment.*': { lastEvent: 'onPostBuild' },
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
  edge_handlers: { lastEvent: 'onPostBuild' },
  'functions.*': { lastEvent: 'onBuild', denormalize: denormalizeFunctionLikeTopProps.bind(undefined, 'functions') },
  'functions.*.*': { lastEvent: 'onBuild' },
  'builders.*': { lastEvent: 'onBuild', denormalize: denormalizeFunctionLikeTopProps.bind(undefined, 'builders') },
  'builders.*.*': { lastEvent: 'onBuild' },
  headers: { lastEvent: 'onPostBuild' },
  redirects: { lastEvent: 'onPostBuild' },
}

module.exports = { applyMutations }
