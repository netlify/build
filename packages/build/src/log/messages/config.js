import { cleanupConfig } from '@netlify/config'

import { DEFAULT_FEATURE_FLAGS } from '../../core/feature_flags.js'
import { omit } from '../../utils/omit.js'
import { logMessage, logObject, logSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

export const logFlags = function (logs, flags, { debug }) {
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
  'edgeFunctionsDistDir',
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

export const logBuildDir = function (logs, buildDir) {
  logSubHeader(logs, 'Current directory')
  logMessage(logs, buildDir)
}

export const logConfigPath = function (logs, configPath = NO_CONFIG_MESSAGE) {
  logSubHeader(logs, 'Config file')
  logMessage(logs, configPath)
}

const NO_CONFIG_MESSAGE = 'No config file was defined: using default values.'

export const logConfig = function ({ logs, netlifyConfig, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Resolved config')
  logObject(logs, cleanupConfig(netlifyConfig))
}

export const logConfigOnUpdate = function ({ logs, netlifyConfig, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Updated config')
  logObject(logs, cleanupConfig(netlifyConfig))
}

export const logConfigOnError = function ({ logs, netlifyConfig, severity }) {
  if (netlifyConfig === undefined || severity === 'none') {
    return
  }

  logMessage(logs, THEME.errorSubHeader('Resolved config'))
  logObject(logs, cleanupConfig(netlifyConfig))
}

export const logContext = function (logs, context) {
  if (context === undefined) {
    return
  }

  logSubHeader(logs, 'Context')
  logMessage(logs, context)
}
