const { dirname } = require('path')
const {
  env: { NETLIFY_TOKEN },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')

const { logOptions, logConfigPath } = require('../log/main')

// Retrieve configuration object
const loadConfig = async function({ options, options: { token = NETLIFY_TOKEN, config, cwd, context } }) {
  logOptions(options)

  const configPath = await getConfigPath(config, cwd)
  logConfigPath(configPath)
  const baseDir = dirname(configPath)

  try {
    const config = await resolveConfig(configPath, { cwd, context })
    return { config, configPath, token, baseDir }
  } catch (error) {
    error.message = `Netlify configuration error:\n${error.message}`
    throw error
  }
}

module.exports = { loadConfig }
