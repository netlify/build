'use strict'

const resolveConfig = require('@netlify/config')
const mapObj = require('map-obj')

const { getChildEnv } = require('../env/main')
const { addApiErrorHandlers } = require('../error/api')
const { addErrorInfo } = require('../error/info')
const { logBuildDir, logConfigPath, logConfig, logContext } = require('../log/messages/config')
const { measureDuration } = require('../time/main')
const { getPackageJson } = require('../utils/package')

// Retrieve configuration object
const tLoadConfig = async function ({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
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
}) {
  const {
    configPath,
    buildDir,
    config: netlifyConfig,
    context: contextA,
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
  const { packageJson } = await getPackageJson(buildDir)
  return { netlifyConfig, configPath, buildDir, packageJson, childEnv, token: tokenA, api: apiA, siteInfo }
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
