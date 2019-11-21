const {
  env: { NETLIFY_TOKEN, CONTEXT },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath, getBaseDir } = require('@netlify/config')

const { logOptions, logConfigPath } = require('../log/main')

// Retrieve configuration object
const loadConfig = async function({ options: { config, cwd }, options: { token = NETLIFY_TOKEN, ...options } }) {
  logOptions(options)

  const optionsA = { ...DEFAULT_OPTIONS, ...options }

  const configPath = await getConfigPath(config, cwd)
  logConfigPath(configPath)
  const baseDir = await getBaseDir(configPath)

  try {
    const configA = await resolveConfig(configPath, optionsA)
    return { config: configA, configPath, token, baseDir }
  } catch (error) {
    error.message = `Netlify configuration error:\n${error.message}`
    throw error
  }
}

const DEFAULT_CONTEXT = 'production'
const DEFAULT_OPTIONS = { context: CONTEXT || DEFAULT_CONTEXT }

module.exports = { loadConfig }
