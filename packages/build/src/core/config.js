const {
  env: { NETLIFY_AUTH_TOKEN, CONTEXT },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath, getBaseDir } = require('@netlify/config')
const filterObj = require('filter-obj')

const { logFlags, logCurrentDirectory, logConfigPath } = require('../log/main')

// Retrieve configuration object
const loadConfig = async function(flags) {
  const flagsA = filterObj(flags, isDefined)
  logFlags(flagsA)
  logCurrentDirectory()

  const flagsB = { ...DEFAULT_FLAGS, ...flagsA }
  const { config, cwd, dry, token, siteId, context } = flagsB

  // Retrieve configuration file path and base directory
  const configPath = await getConfigPath(config, cwd)
  logConfigPath(configPath)
  const baseDir = await getBaseDir(configPath)

  const netlifyConfig = await resolveFullConfig(configPath, flagsB)
  return { netlifyConfig, configPath, baseDir, token, dry, siteId, context }
}

// Remove undefined and empty CLI flags
const isDefined = function(key, value) {
  return Boolean(value)
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
