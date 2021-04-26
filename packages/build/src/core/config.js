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

// Retrieve configuration object
const tLoadConfig = async function ({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
  apiHost,
  token,
  siteId,
  context,
  branch,
  baseRelDir,
  envOpt,
  debug,
  mode,
  offline,
  deployId,
  logs,
  testOpts,
  nodePath,
}) {
  const {
    configPath,
    buildDir,
    config: netlifyConfig,
    context: contextA,
    apiHost: apiHostA,
    token: tokenA,
    api,
    siteInfo,
    env,
  } = await resolveFullConfig({
    config,
    defaultConfig,
    cachedConfig,
    cwd,
    repositoryRoot,
    context,
    branch,
    baseRelDir,
    apiHost,
    token,
    siteId,
    deployId,
    mode,
    offline,
    envOpt,
    testOpts,
  })
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
    apiHost: apiHostA,
    token: tokenA,
    api: apiA,
    siteInfo,
  }
}

const loadConfig = measureDuration(tLoadConfig, 'resolve_config')

// Retrieve configuration file and related information
// (path, build directory, etc.)
const resolveFullConfig = async function ({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
  context,
  branch,
  baseRelDir,
  apiHost,
  token,
  siteId,
  deployId,
  mode,
  offline,
  envOpt,
  testOpts,
}) {
  try {
    return await resolveConfig({
      config,
      defaultConfig,
      cachedConfig,
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
    })
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

module.exports = { loadConfig }
