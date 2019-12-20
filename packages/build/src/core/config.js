const {
  env: { NETLIFY_TOKEN, CONTEXT },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath, getBaseDir } = require('@netlify/config')

const { logFlags, logConfigPath } = require('../log/main')

// Retrieve configuration object
const loadConfig = async function({ flags: { config, cwd }, flags: { token = NETLIFY_TOKEN, ...flags } }) {
  logFlags(flags)

  const flagsA = { ...DEFAULT_FLAGS, ...flags }

  const configPath = await getConfigPath(config, cwd)
  logConfigPath(configPath)
  const baseDir = await getBaseDir(configPath)

  try {
    const netlifyConfig = await resolveConfig(configPath, flagsA)
    return { netlifyConfig, configPath, token, baseDir }
  } catch (error) {
    error.message = `Netlify configuration error:\n${error.message}`
    throw error
  }
}

const DEFAULT_CONTEXT = 'production'
const DEFAULT_FLAGS = { context: CONTEXT || DEFAULT_CONTEXT }

module.exports = { loadConfig }
