const {
  env: { NETLIFY_AUTH_TOKEN, CONTEXT },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath, getBaseDir } = require('@netlify/config')

const { logFlags, logCurrentDirectory, logConfigPath } = require('../log/main')
const { addErrorInfo } = require('../error/info')
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

  const { configPath, netlifyConfig, baseDir } = await resolveFullConfig({ config, cwd, flags: flagsC })

  const siteInfo = await getSiteInfo(token, siteId)
  return { netlifyConfig, configPath, baseDir, token, dry, siteInfo, context }
}

// Default values of CLI flags
const DEFAULT_FLAGS = {
  token: NETLIFY_AUTH_TOKEN,
  context: CONTEXT || 'local',
}

// Retrieve configuration file path and base directory
// Then load configuration file
const resolveFullConfig = async function({ config, cwd, flags }) {
  try {
    const configPath = await getConfigPath(config, cwd)
    logConfigPath(configPath)
    const baseDir = await getBaseDir(configPath)

    const netlifyConfig = await resolveConfig(configPath, flags)
    return { configPath, netlifyConfig, baseDir }
  } catch (error) {
    if (error.type === 'userError') {
      delete error.type
      addErrorInfo(error, { type: 'resolveConfig' })
    }
    throw error
  }
}

module.exports = { loadConfig }
