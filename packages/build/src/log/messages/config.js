'use strict'

const { readFile } = require('fs')
const { inspect, promisify } = require('util')

const { cleanupConfig } = require('@netlify/config')
const pathExists = require('path-exists')

const { DEFAULT_FEATURE_FLAGS } = require('../../core/feature_flags')
const { omit } = require('../../utils/omit')
const { log, logMessage, logObject, logSubHeader } = require('../logger')
const { THEME } = require('../theme')

const pReadFile = promisify(readFile)

const logFlags = function (logs, flags, { debug }) {
  const flagsA = cleanFeatureFlags(flags)
  const hiddenFlags = debug ? HIDDEN_DEBUG_FLAGS : HIDDEN_FLAGS
  const flagsB = omit(flagsA, hiddenFlags)
  logSubHeader(logs, 'Flags')
  logObject(logs, flagsB)
}

// We only show feature flags related to `@netlify/build`.
// Also, we only print enabled feature flags.
const cleanFeatureFlags = function ({ featureFlags = {}, ...flags }) {
  const cleanedFeatureFlags = Object.entries(featureFlags)
    .filter(shouldPrintFeatureFlag)
    .map(([featureFlagName]) => featureFlagName)
  return cleanedFeatureFlags.length === 0 ? flags : { ...flags, featureFlags: cleanedFeatureFlags }
}

const shouldPrintFeatureFlag = function ([featureFlagName, enabled]) {
  return enabled && featureFlagName in DEFAULT_FEATURE_FLAGS
}

// Hidden because the value is security-sensitive
const SECURE_FLAGS = ['token', 'bugsnagKey', 'env', 'cachedConfig', 'defaultConfig']
// Hidden because those are used in tests
const TEST_FLAGS = ['buffer', 'telemetry']
// Hidden because those are only used internally
const INTERNAL_FLAGS = [
  'nodePath',
  'functionsDistDir',
  'defaultConfig',
  'cachedConfigPath',
  'sendStatus',
  'saveConfig',
  'statsd',
  'framework',
  'featureFlags',
  'buildbotServerSocket',
  'testOpts',
  'siteId',
  'context',
  'branch',
  'cwd',
  'repositoryRoot',
  'mode',
  'apiHost',
  'cacheDir',
]
const HIDDEN_FLAGS = [...SECURE_FLAGS, ...TEST_FLAGS, ...INTERNAL_FLAGS]
const HIDDEN_DEBUG_FLAGS = [...SECURE_FLAGS, ...TEST_FLAGS]

const logBuildDir = function (logs, buildDir) {
  logSubHeader(logs, 'Current directory')
  logMessage(logs, buildDir)
}

const logConfigPath = function (logs, configPath = NO_CONFIG_MESSAGE) {
  logSubHeader(logs, 'Config file')
  logMessage(logs, configPath)
}

const NO_CONFIG_MESSAGE = 'No config file was defined: using default values.'

const logConfig = function ({ logs, netlifyConfig, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Resolved config')
  logObject(logs, cleanupConfig(netlifyConfig))
}

const logConfigOnUpdate = function ({ logs, netlifyConfig, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Updated config')
  logObject(logs, cleanupConfig(netlifyConfig))
}

const logConfigOnError = function ({ logs, netlifyConfig, severity }) {
  if (netlifyConfig === undefined || severity === 'none') {
    return
  }

  logMessage(logs, THEME.errorSubHeader('Resolved config'))
  logObject(logs, cleanupConfig(netlifyConfig))
}

const logContext = function (logs, context) {
  if (context === undefined) {
    return
  }

  logSubHeader(logs, 'Context')
  logMessage(logs, context)
}

const logConfigMutations = function (logs, newConfigMutations) {
  newConfigMutations.forEach(({ keysString, value }) => {
    logConfigMutation(logs, keysString, value)
  })
}

const logConfigMutation = function (logs, keysString, value) {
  log(logs, `Netlify configuration property "${keysString}" value changed to ${inspect(value, { colors: false })}.`)
}

const logConfigOnUpload = async function ({ logs, configPath, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Uploaded config')

  if (!(await pathExists(configPath))) {
    logMessage(logs, 'No netlify.toml')
    return
  }

  const configContents = await pReadFile(configPath, 'utf8')
  logMessage(logs, configContents)
}

const logRedirectsOnUpload = async function ({ logs, redirectsPath, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Uploaded _redirects')

  if (!(await pathExists(redirectsPath))) {
    logMessage(logs, 'No _redirects\n')
    return
  }

  const redirectsContents = await pReadFile(redirectsPath, 'utf8')
  logMessage(logs, `${redirectsContents}\n`)
}

module.exports = {
  logFlags,
  logBuildDir,
  logConfigPath,
  logConfig,
  logConfigOnUpdate,
  logConfigOnError,
  logContext,
  logConfigMutations,
  logConfigOnUpload,
  logRedirectsOnUpload,
}
