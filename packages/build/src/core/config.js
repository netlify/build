const { dirname } = require('path')
const { NETLIFY_TOKEN, CONTEXT } = require('process').env

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
const omit = require('omit.js')

const { logOptions, logConfigPath } = require('../log/main')

// Retrieve configuration object
const loadConfig = async function(options) {
  const optsWithDefaults = Object.assign(
    {},
    {
      ...(CONTEXT && { context: CONTEXT }),
      ...(NETLIFY_TOKEN && { token: NETLIFY_TOKEN }),
    },
    options,
  )
  const opts = omit(optsWithDefaults, ['token'])
  logOptions(opts)

  const configPath = await getConfigPath(options.config, options.cwd)
  logConfigPath(configPath)
  const baseDir = dirname(configPath)

  try {
    const config = await resolveConfig(configPath, opts)
    return {
      config,
      configPath,
      token: optsWithDefaults.token,
      baseDir,
    }
  } catch (error) {
    error.message = `Netlify configuration error:\n${error.message}`
    throw error
  }
}

module.exports = { loadConfig }
