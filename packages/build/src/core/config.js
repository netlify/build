/* eslint-disable max-lines */
'use strict'

const resolveConfig = require('@netlify/config')
const { updateConfig, restoreConfig } = require('@netlify/config')
const mapObj = require('map-obj')

const { getChildEnv } = require('../env/main')
const { addApiErrorHandlers } = require('../error/api')
const { addErrorInfo } = require('../error/info')
const {
  logBuildDir,
  logConfigPath,
  logConfig,
  logContext,
  logConfigOnUpload,
  logRedirectsOnUpload,
} = require('../log/messages/config')
const { measureDuration } = require('../time/main')
const { getPackageJson } = require('../utils/package')

const { getUserNodeVersion } = require('./user_node_version')

// Retrieve immutable options passed to `@netlify/config`.
// This does not include options which might change during the course of the
// build:
//  - `cachedConfig` and `cachedConfigPath` are only used at the beginning of
//    the build
//  - If plugins change the configuration, `configMutations` is used instead
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
    redirectsPath,
    buildDir,
    repositoryRoot,
    config: netlifyConfig,
    context: contextA,
    branch: branchA,
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
    redirectsPath,
    buildDir,
    repositoryRoot,
    packageJson,
    userNodeVersion,
    childEnv,
    context: contextA,
    branch: branchA,
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
const resolveUpdatedConfig = async function (configOpts, configMutations) {
  try {
    return await resolveConfig({ ...configOpts, configMutations, buffer: true })
  } catch (error) {
    if (error.type === 'configMutation') {
      // We need to mutate the `error` directly to preserve its `name`, `stack`, etc.
      // eslint-disable-next-line fp/no-delete
      delete error.type
      addErrorInfo(error, { type: 'pluginValidation' })
    }
    throw error
  }
}

// If the configuration was changed, persist it to `netlify.toml`.
// If `netlify.toml` does not exist, create it inside repository root.
// This is only done when `saveConfig` is `true`. This allows performing this
// in the buildbot but not in local builds, since only the latter run in a
// container and we want to avoid saving files on local machines.
const saveUpdatedConfig = async function ({
  configMutations,
  buildDir,
  repositoryRoot,
  configPath = `${repositoryRoot}/netlify.toml`,
  redirectsPath,
  logs,
  context,
  branch,
  debug,
  saveConfig,
}) {
  if (!saveConfig) {
    return
  }

  await updateConfig(configMutations, { buildDir, configPath, redirectsPath, context, branch })
  await logConfigOnUpload({ logs, configPath, debug })
  await logRedirectsOnUpload({ logs, redirectsPath, debug })
}

const restoreUpdatedConfig = async function ({
  buildDir,
  repositoryRoot,
  configPath = `${repositoryRoot}/netlify.toml`,
  redirectsPath,
  saveConfig,
}) {
  if (!saveConfig) {
    return
  }

  await restoreConfig({ buildDir, configPath, redirectsPath })
}

module.exports = {
  getConfigOpts,
  loadConfig,
  resolveUpdatedConfig,
  saveUpdatedConfig,
  restoreUpdatedConfig,
}
/* eslint-enable max-lines */
