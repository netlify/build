const {
  env: { NETLIFY_AUTH_TOKEN, CONTEXT },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath, getBaseDir } = require('@netlify/config')

const { logFlags, logCurrentDirectory, logConfigPath } = require('../log/main')
const { removeFalsy } = require('../utils/remove_falsy')

const { getSiteInfo } = require('./site_info')

// Retrieve configuration object
const loadConfig = async function(flags) {
  const flagsA = removeFalsy(flags)
  logFlags(flagsA)
  logCurrentDirectory()

  const flagsB = { ...DEFAULT_FLAGS, ...flagsA }
  const flagsC = removeFalsy(flagsB)
  const { config, cwd, dry, token, siteId, context } = flagsC

  // Retrieve configuration file path and base directory
  const configPath = await getConfigPath(config, cwd)
  logConfigPath(configPath)
  const baseDir = await getBaseDir(configPath)

  const netlifyConfig = await resolveFullConfig(configPath, flagsC)

  const siteInfo = await getSiteInfo(token, siteId)
  return { netlifyConfig, configPath, baseDir, token, dry, siteInfo, context }
}

// Default values of CLI flags
const DEFAULT_FLAGS = {
  token: NETLIFY_AUTH_TOKEN,
  context: CONTEXT || 'local',
}

// Load configuration file
const resolveFullConfig = async function(configPath, flags) {
  try {
    return await resolveConfig(configPath, flags)
  } catch (error) {
    error.message = `Netlify configuration error:\n${error.message}`
    throw error
  }
}

module.exports = { loadConfig }
