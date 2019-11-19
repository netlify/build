const { dirname } = require('path')
const {
  env: { NETLIFY_TOKEN, CONTEXT },
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
const filterObj = require('filter-obj')

const { logOptions, logConfigPath } = require('../log/main')

// Retrieve configuration object
const loadConfig = async function({
  options: { cwd, config },
  options: { token = NETLIFY_TOKEN, context = CONTEXT, ...options },
}) {
  const optionsA = { ...options, context }
  const optionsB = filterObj(optionsA, isDefined)

  logOptions(optionsB)

  const optionsC = { ...DEFAULT_OPTIONS, ...optionsB }

  const configPath = await getConfigPath(config, cwd)
  logConfigPath(configPath)
  const baseDir = dirname(configPath)

  try {
    const configA = await resolveConfig(configPath, optionsC)
    return { config: configA, configPath, token, baseDir }
  } catch (error) {
    error.message = `Netlify configuration error:\n${error.message}`
    throw error
  }
}

const DEFAULT_OPTIONS = { context: 'production' }

const isDefined = function(key, value) {
  return value !== undefined
}

module.exports = { loadConfig }
