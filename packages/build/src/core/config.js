'use strict'

const resolveConfig = require('@netlify/config')
const mapObj = require('map-obj')

const { getChildEnv } = require('../env/main')
const { addApiErrorHandlers } = require('../error/api')
const { addErrorInfo } = require('../error/info')
const { logBuildDir, logConfigPath, logConfig, logContext } = require('../log/messages/config')
const { measureDuration } = require('../time/main')
const { getPackageJson } = require('../utils/package')

const { getUserNodeVersion } = require('./user_node_version')

// Retrieve immutable options passed to `@netlify/config`.
// This does not include options which might change during the course of the
// build:
//  - `cachedConfig` and `cachedConfigPath` are only used at the beginning of
//    the build
//  - If plugins change the configuration, `priorityConfig` is used instead
// In both cases, almost all options should remain the same.
const getConfigOpts = function ({
  config,
  defaultConfig,
  cwd,
  repositoryRoot,
  apiHost,
  token,
  siteId,
  context,
  branch,
  baseRelDir,
  envOpt,
  mode,
  offline,
  deployId,
  testOpts,
  featureFlags,
}) {
  return {
    config,
    defaultConfig,
    cwd,
    repositoryRoot,
    context,
    branch,
    baseRelDir,
    host: apiHost,
    token,
    siteId,
    deployId,
    mode,
    offline,
    env: envOpt,
    testOpts,
    featureFlags,
  }
}

// Retrieve configuration object
const tLoadConfig = async function ({ configOpts, cachedConfig, cachedConfigPath, envOpt, debug, logs, nodePath }) {
  const {
    configPath,
    buildDir,
    config: netlifyConfig,
    context: contextA,
    branch: branchA,
    apiHost: apiHostA,
    token: tokenA,
    api,
    siteInfo,
    env,
  } = await resolveInitialConfig(configOpts, cachedConfig, cachedConfigPath)
  logConfigInfo({ logs, configPath, buildDir, netlifyConfig, context: contextA, debug })

  const apiA = addApiErrorHandlers(api)
  const envValues = mapObj(env, (key, { value }) => [key, value])
  const childEnv = getChildEnv({ envOpt, env: envValues })
  const [{ packageJson }, userNodeVersion] = await Promise.all([getPackageJson(buildDir), getUserNodeVersion(nodePath)])
  return {
    netlifyConfig,
    configPath,
    buildDir,
    packageJson,
    userNodeVersion,
    childEnv,
    context: contextA,
    branch: branchA,
    apiHost: apiHostA,
    token: tokenA,
    api: apiA,
    siteInfo,
  }
}

const loadConfig = measureDuration(tLoadConfig, 'resolve_config')

// Retrieve initial configuration.
// In the buildbot and CLI, we re-use the already parsed `@netlify/config`
// return value which is passed as `cachedConfig`/`cachedConfigPath`.
const resolveInitialConfig = async function (configOpts, cachedConfig, cachedConfigPath) {
  try {
    return await resolveConfig({ ...configOpts, cachedConfig, cachedConfigPath })
  } catch (error) {
    if (error.type === 'userError') {
      // We need to mutate the `error` directly to preserve its `name`, `stack`, etc.
      // eslint-disable-next-line fp/no-delete
      delete error.type
      addErrorInfo(error, { type: 'resolveConfig' })
    }
    throw error
  }
}

const logConfigInfo = function ({ logs, configPath, buildDir, netlifyConfig, context, debug }) {
  logBuildDir(logs, buildDir)
  logConfigPath(logs, configPath)
  logConfig({ logs, netlifyConfig, debug })
  logContext(logs, context)
}

// Retrieve the configuration after it's been changed.
// This ensures any configuration changes done by plugins is validated and
// normalized.
// We use `buffer: false` to avoid any logs. Otherwise every configuration
// change would create logs (e.g. warnings) which would be too verbose. Errors
// are still propagated though and assigned to the specific plugin or core
// command which changed the configuration.
const resolveUpdatedConfig = async function ({ configOpts, priorityConfig, context, branch }) {
  const normalizedPriorityConfig = normalizePriorityConfig({ priorityConfig, context, branch })
  const { config } = await resolveConfig({ ...configOpts, priorityConfig: normalizedPriorityConfig, buffer: true })
  return config
}

// Ensure `priorityConfig` has a higher priority than `context` properties
const normalizePriorityConfig = function ({ priorityConfig, context, branch }) {
  return { context: { [context]: priorityConfig, [branch]: priorityConfig } }
}

module.exports = { getConfigOpts, loadConfig, resolveUpdatedConfig }
