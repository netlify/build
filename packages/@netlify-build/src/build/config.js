const path = require('path')
const {
  cwd,
  env: { NETLIFY_TOKEN }
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')

const { logOptions, logConfigPath, logConfigError } = require('./log')

// Retrieve configuration object
const loadConfig = async function({ options, options: { token, config } }) {
  logOptions(options)

  const netlifyToken = token || NETLIFY_TOKEN

  const netlifyConfigPath = config || (await getConfigPath())
  logConfigPath(netlifyConfigPath)
  const baseDir = getBaseDir(netlifyConfigPath)

  try {
    const netlifyConfig = await resolveConfig(netlifyConfigPath, options)
    return { netlifyConfig, netlifyConfigPath, netlifyToken, baseDir }
  } catch (error) {
    logConfigError()
    throw error
  }
}

const getBaseDir = function(netlifyConfigPath) {
  if (netlifyConfigPath === undefined) {
    return cwd()
  }

  return path.dirname(netlifyConfigPath)
}

module.exports = { loadConfig }
