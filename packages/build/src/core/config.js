const {
  env: { NETLIFY_AUTH_TOKEN },
  execPath,
} = require('process')

const resolveConfig = require('@netlify/config')

const { logFlags, logBuildDir, logConfigPath } = require('../log/main')
const { addErrorInfo } = require('../error/info')
const { removeFalsy } = require('../utils/remove_falsy')

const { getApiClient } = require('./api')
const { getSiteInfo } = require('./site_info')

// Retrieve configuration object
const loadConfig = async function(flags) {
  const flagsA = removeFalsy(flags)
  logFlags(flagsA)

  const flagsB = { ...DEFAULT_FLAGS, ...flagsA }
  const {
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
  } = removeFalsy(flagsB)

  const { configPath, buildDir, config: netlifyConfig, context: contextA, branch: branchA } = await resolveFullConfig({
    config,
    defaultConfig,
    cachedConfig,
    cwd,
    repositoryRoot,
    context,
    branch,
    baseRelDir,
  })
  logBuildDir(buildDir)
  logConfigPath(configPath)

  const api = getApiClient(token)
  const siteInfo = await getSiteInfo(api, siteId)
  return {
    netlifyConfig,
    configPath,
    buildDir,
    nodePath,
    api,
    token,
    dry,
    siteInfo,
    context: contextA,
    branch: branchA,
  }
}

// Default values of CLI flags
const DEFAULT_FLAGS = {
  nodePath: execPath,
  token: NETLIFY_AUTH_TOKEN,
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
    })
  } catch (error) {
    if (error.type === 'userError') {
      delete error.type
      addErrorInfo(error, { type: 'resolveConfig' })
    }
    throw error
  }
}

module.exports = { loadConfig }
