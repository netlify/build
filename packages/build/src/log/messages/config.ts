import { cleanupConfig } from '@netlify/config'

import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from '../../core/feature_flags.js'
import type { NetlifyConfig } from '../../types/config/netlify_config.js'
import { omit } from '../../utils/omit.js'
import { type Logs, logMessage, logObject, logSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

type Flags = { featureFlags?: FeatureFlags; [flag: string]: unknown }

// `cleanupConfig()`'s types are inferred from JavaScript: `plugins = []` makes it `never[]` and the return value `any`
const cleanupNetlifyConfig: (netlifyConfig: NetlifyConfig) => object = cleanupConfig as (
  netlifyConfig: object,
) => object

export const logFlags = function (logs: Logs | undefined, flags: Flags, { debug }: { debug?: boolean }) {
  const flagsA = cleanFeatureFlags(flags)
  const hiddenFlags = debug ? HIDDEN_DEBUG_FLAGS : HIDDEN_FLAGS
  const flagsB = omit(flagsA, hiddenFlags)
  logSubHeader(logs, 'Flags')
  logObject(logs, flagsB)
}

// We only show feature flags related to `@netlify/build`.
// Also, we only print enabled feature flags.
const cleanFeatureFlags = function ({ featureFlags = {}, ...flags }: Flags): Record<string, unknown> {
  const cleanedFeatureFlags = Object.entries(featureFlags)
    .filter(shouldPrintFeatureFlag)
    .map(([featureFlagName]) => featureFlagName)
  return cleanedFeatureFlags.length === 0 ? flags : { ...flags, featureFlags: cleanedFeatureFlags }
}

const shouldPrintFeatureFlag = function ([featureFlagName, enabled]: [string, boolean]) {
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
  'tracing',
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
  'systemLogFile',
  'timeline',
  'explicitSecretKeys',
  'enhancedSecretScan',
  'edgeFunctionsBootstrapURL',
  'eventHandlers',
  'logger',
  'skewProtectionToken',
]
const HIDDEN_FLAGS = [...SECURE_FLAGS, ...TEST_FLAGS, ...INTERNAL_FLAGS]
const HIDDEN_DEBUG_FLAGS = [...SECURE_FLAGS, ...TEST_FLAGS, 'eventHandlers', 'logger']

export const logBuildDir = function (logs: Logs | undefined, buildDir: string) {
  logSubHeader(logs, 'Current directory')
  logMessage(logs, buildDir)
}

export const logConfigPath = function (logs: Logs | undefined, configPath: string = NO_CONFIG_MESSAGE) {
  logSubHeader(logs, 'Config file')
  logMessage(logs, configPath)
}

const NO_CONFIG_MESSAGE = 'No config file was defined: using default values.'

export const logConfig = function ({
  logs,
  netlifyConfig,
  debug,
}: {
  logs: Logs | undefined
  netlifyConfig: NetlifyConfig
  debug: boolean
}) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Resolved config')
  logObject(logs, cleanupNetlifyConfig(netlifyConfig))
}

export const logConfigOnUpdate = function ({
  logs,
  netlifyConfig,
  debug,
}: {
  logs: Logs | undefined
  netlifyConfig: NetlifyConfig
  debug: boolean
}) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Updated config')
  logObject(logs, cleanupNetlifyConfig(netlifyConfig))
}

export const logConfigOnError = function ({
  logs,
  netlifyConfig,
  severity,
}: {
  logs: Logs | undefined
  netlifyConfig: NetlifyConfig | undefined
  severity: string
}) {
  if (netlifyConfig === undefined || severity === 'none') {
    return
  }

  logMessage(logs, THEME.errorSubHeader('Resolved config'))
  logObject(logs, cleanupNetlifyConfig(netlifyConfig))
}

export const logContext = function (logs: Logs | undefined, context: string | undefined) {
  if (context === undefined) {
    return
  }

  logSubHeader(logs, 'Context')
  logMessage(logs, context)
}
