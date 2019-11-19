const { dirname } = require('path')
const {
  env: { NETLIFY_TOKEN, CONTEXT },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')

const { logOptions, logConfigPath } = require('../log/main')

// Retrieve configuration object
const loadConfig = async function({ options, options: { token = NETLIFY_TOKEN, config, cwd, context = CONTEXT } }) {
  logOptions(options)

  const configPath = await getConfigPath(config, cwd)
  logConfigPath(configPath)
  const baseDir = dirname(configPath)

  try {
    const configA = await resolveConfig(configPath, { cwd, context })
    return { config: configA, configPath, token, baseDir }
  } catch (error) {
    error.message = `Netlify configuration error:\n${error.message}`
    throw error
  }
}

module.exports = { loadConfig }
