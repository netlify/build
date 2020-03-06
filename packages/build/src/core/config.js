const {
  env: { NETLIFY_AUTH_TOKEN },
  execPath,
} = require('process')

const resolveConfig = require('@netlify/config')

const { logFlags, logBuildDir, logConfigPath } = require('../log/main')
const { addErrorInfo } = require('../error/info')
const { removeFalsy } = require('../utils/remove_falsy')

const { getSiteInfo } = require('./site_info')

// Retrieve configuration object
const loadConfig = async function(flags) {
  const flagsA = removeFalsy(flags)
  logFlags(flagsA)

  const flagsB = { ...DEFAULT_FLAGS, ...flagsA }
  const { config, cwd, repositoryRoot, dry, nodePath, token, siteId, context, branch } = removeFalsy(flagsB)

  const {
    configPath,
    buildDir,
    config: netlifyConfig,
    context: contextA,
    branch: branchA,
  } = await resolveFullConfig(config, { cwd, repositoryRoot, context, branch })
  logBuildDir(buildDir)
  logConfigPath(configPath)

  const siteInfo = await getSiteInfo(token, siteId)
  return { netlifyConfig, configPath, buildDir, nodePath, token, dry, siteInfo, context: contextA, branch: branchA }
}

// Default values of CLI flags
const DEFAULT_FLAGS = {
  nodePath: execPath,
  token: NETLIFY_AUTH_TOKEN,
}

// Retrieve configuration file and related information
// (path, build directory, etc.)
const resolveFullConfig = async function(config, { cwd, repositoryRoot, context, branch }) {
  try {
    return await resolveConfig(config, { cwd, repositoryRoot, context, branch })
  } catch (error) {
    if (error.type === 'userError') {
      delete error.type
      addErrorInfo(error, { type: 'resolveConfig' })
    }
    throw error
  }
}

module.exports = { loadConfig }
