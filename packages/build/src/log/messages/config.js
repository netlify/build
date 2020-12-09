'use strict'

const { cleanupConfig } = require('@netlify/config')

const { omit } = require('../../utils/omit')
const { logMessage, logObject, logSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logFlags = function (logs, flags, { debug }) {
  const hiddenFlags = debug ? HIDDEN_DEBUG_FLAGS : HIDDEN_FLAGS
  const flagsA = omit(flags, hiddenFlags)
  logSubHeader(logs, 'Flags')
  logObject(logs, flagsA)
}

// Hidden because the value is security-sensitive
const SECURE_FLAGS = ['token', 'bugsnagKey', 'env', 'cachedConfig', 'defaultConfig']
// Hidden because those are used in tests
const TEST_FLAGS = ['buffer', 'telemetry']
// Hidden because those are only used internally
const INTERNAL_FLAGS = [
  'nodePath',
  'functionsDistDir',
  'sendStatus',
  'statsd',
  'framework',
  'featureFlags',
  'buildbotServerSocket',
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

module.exports = {
  logFlags,
  logBuildDir,
  logConfigPath,
  logConfig,
  logConfigOnError,
  logContext,
}
