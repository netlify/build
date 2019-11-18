const { dirname } = require('path')
const {
  env: { NETLIFY_TOKEN },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
const omit = require('omit.js')

const { logOptions, logConfigPath } = require('../log/main')

// Retrieve configuration object
const loadConfig = async function(options) {
  const { token = NETLIFY_TOKEN, config, cwd, context } = options
  const opts = omit(options, ['token', 'dry', 'cwd'])
  logOptions(opts)

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
