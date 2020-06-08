const { env, execPath } = require('process')

const resolveConfig = require('@netlify/config')

const { addApiErrorHandlers } = require('../error/api')
const { addErrorInfo } = require('../error/info')
const { logFlags, logBuildDir, logConfigPath, logConfig, logContext } = require('../log/main')
const { removeFalsy } = require('../utils/remove_falsy')

const { getConstants } = require('./constants')

// Normalize CLI flags
const normalizeFlags = function(flags, logs) {
  const flagsA = removeFalsy(flags)
  logFlags(logs, flagsA)

  const defaultFlags = getDefaultFlags(flagsA)
  const flagsB = { ...defaultFlags, ...flagsA }
  const flagsC = removeFalsy(flagsB)
  return flagsC
}

// Default values of CLI flags
const getDefaultFlags = function({ env: envOpt = {} }) {
  const combinedEnv = { ...env, ...envOpt }
  return {
    env: envOpt,
    nodePath: execPath,
    token: combinedEnv.NETLIFY_AUTH_TOKEN,
    mode: 'require',
    deployId: combinedEnv.DEPLOY_ID,
    debug: Boolean(combinedEnv.NETLIFY_BUILD_DEBUG),
    bugsnagKey: combinedEnv.BUGSNAG_KEY,
    telemetry: !combinedEnv.BUILD_TELEMETRY_DISABLED,
    testOpts: {},
  }
}

// Retrieve configuration object
const loadConfig = async function(
  {
    config,
    defaultConfig,
    cachedConfig,
    cwd,
    repositoryRoot,
    dry,
    nodePath,
    token,
    siteId,
    deployId,
    context,
    branch,
    baseRelDir,
    env: envOpt,
    telemetry,
    mode,
    debug,
  },
  logs,
  testOpts,
) {
  const {
    configPath,
    buildDir,
    config: netlifyConfig,
    context: contextA,
    branch: branchA,
    api,
    siteInfo,
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
    mode,
    envOpt,
    testOpts,
  })
  logBuildDir(logs, buildDir)
  logConfigPath(logs, configPath)
  logConfig({ logs, netlifyConfig, debug })
  logContext(logs, contextA)

  const apiA = addApiErrorHandlers(api)
  const constants = await getConstants({ configPath, buildDir, netlifyConfig, siteInfo, deployId, mode, testOpts })
  return {
    netlifyConfig,
    configPath,
    buildDir,
    nodePath,
    api: apiA,
    dry,
    siteInfo,
    deployId,
    constants,
    context: contextA,
    branch: branchA,
    envOpt,
    telemetry,
    mode,
  }
}

// Retrieve configuration file and related information
// (path, build directory, etc.)
const resolveFullConfig = async function({
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
  mode,
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
      mode,
      env: envOpt,
      testOpts,
    })
  } catch (error) {
    if (error.type === 'userError') {
      delete error.type
      addErrorInfo(error, { type: 'resolveConfig' })
    }
    throw error
  }
}

module.exports = { normalizeFlags, loadConfig }
