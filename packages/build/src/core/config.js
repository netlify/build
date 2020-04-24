const {
  env: { NETLIFY_AUTH_TOKEN },
  execPath,
} = require('process')

const resolveConfig = require('@netlify/config')

const { addApiErrorHandlers } = require('../error/api')
const { addErrorInfo } = require('../error/info')
const { logFlags, logBuildDir, logConfigPath, logConfig, logContext } = require('../log/main')
const { removeFalsy } = require('../utils/remove_falsy')

const { getConstants } = require('./constants')

// Normalize CLI flags
const normalizeFlags = function(flags) {
  const flagsA = removeFalsy(flags)
  logFlags(flagsA)

  const flagsB = { ...DEFAULT_FLAGS, ...flagsA }
  const flagsC = removeFalsy(flagsB)
  return flagsC
}

// Default values of CLI flags
const DEFAULT_FLAGS = {
  nodePath: execPath,
  token: NETLIFY_AUTH_TOKEN,
  mode: 'require',
}

// Retrieve configuration object
const loadConfig = async function({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
  dry,
  nodePath,
  token,
  siteId,
  context,
  branch,
  baseRelDir,
  mode,
}) {
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
  })
  logBuildDir(buildDir)
  logConfigPath(configPath)
  logConfig(netlifyConfig)
  logContext(contextA)

  const apiA = addApiErrorHandlers(api)
  const constants = await getConstants({ configPath, buildDir, netlifyConfig, siteInfo, mode })
  return {
    netlifyConfig,
    configPath,
    buildDir,
    nodePath,
    api: apiA,
    token,
    dry,
    siteInfo,
    constants,
    context: contextA,
    branch: branchA,
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
