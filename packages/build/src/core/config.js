import { resolveConfig, updateConfig, restoreConfig } from '@netlify/config'
import mapObj from 'map-obj'

import { getChildEnv } from '../env/main.js'
import { addApiErrorHandlers } from '../error/api.js'
import { changeErrorType } from '../error/info.js'
import { logBuildDir, logConfigPath, logConfig, logContext } from '../log/messages/config.js'
import { logConfigOnUpload, logHeadersOnUpload, logRedirectsOnUpload } from '../log/messages/mutations.js'
import { measureDuration } from '../time/main.js'
import { getPackageJson } from '../utils/package.js'

import { getUserNodeVersion } from './user_node_version.js'

// Retrieve immutable options passed to `@netlify/config`.
// This does not include options which might change during the course of the
// build:
//  - `cachedConfig` and `cachedConfigPath` are only used at the beginning of
//    the build
//  - If plugins change the configuration, `configMutations` is used instead
// In both cases, almost all options should remain the same.
export const getConfigOpts = function ({
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
  buildId,
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
    buildId,
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
    headersPath,
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
    headersPath,
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

export const loadConfig = measureDuration(tLoadConfig, 'resolve_config')

// Retrieve initial configuration.
// In the buildbot and CLI, we re-use the already parsed `@netlify/config`
// return value which is passed as `cachedConfig`/`cachedConfigPath`.
const resolveInitialConfig = async function (configOpts, cachedConfig, cachedConfigPath) {
  return await resolveConfig({ ...configOpts, cachedConfig, cachedConfigPath })
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
// We use `debug: false` to avoid any debug logs. Otherwise every configuration
// change would create debug logs which would be too verbose.
// Errors are propagated and assigned to the specific plugin or core step
// which changed the configuration.
export const resolveUpdatedConfig = async function (configOpts, configMutations) {
  try {
    return await resolveConfig({ ...configOpts, configMutations, debug: false })
  } catch (error) {
    changeErrorType(error, 'resolveConfig', 'pluginValidation')
    throw error
  }
}

// If the configuration was changed, persist it to `netlify.toml`.
// If `netlify.toml` does not exist, create it inside repository root.
// This is only done when `saveConfig` is `true`. This allows performing this
// in the buildbot but not in local builds, since only the latter run in a
// container and we want to avoid saving files on local machines.
export const saveUpdatedConfig = async function ({
  configMutations,
  buildDir,
  repositoryRoot,
  configPath = `${repositoryRoot}/netlify.toml`,
  headersPath,
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

  await updateConfig(configMutations, {
    buildDir,
    configPath,
    headersPath,
    redirectsPath,
    context,
    branch,
    logs,
  })

  await logConfigOnUpload({ logs, configPath, debug })
  await logHeadersOnUpload({ logs, headersPath, debug })
  await logRedirectsOnUpload({ logs, redirectsPath, debug })
}

export const restoreUpdatedConfig = async function ({
  configMutations,
  buildDir,
  repositoryRoot,
  configPath = `${repositoryRoot}/netlify.toml`,
  headersPath,
  redirectsPath,
  saveConfig,
}) {
  if (!saveConfig) {
    return
  }

  await restoreConfig(configMutations, { buildDir, configPath, headersPath, redirectsPath })
}
