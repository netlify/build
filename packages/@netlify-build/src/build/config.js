const path = require('path')
const {
  cwd,
  env: { NETLIFY_TOKEN }
} = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
const chalk = require('chalk')
const omit = require('omit.js')

const deepLog = require('../utils/deeplog')

const { HEADING_PREFIX } = require('./constants')

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
    console.log('Netlify Config Error')
    throw error
  }
}

const logOptions = function(options) {
  console.log(chalk.cyanBright.bold('Options'))
  deepLog(omit(options, ['token']))
  console.log()
}

const logConfigPath = function(netlifyConfigPath) {
  console.log(chalk.cyanBright.bold(`${HEADING_PREFIX} Using config file: ${netlifyConfigPath}`))
  console.log()
}

const getBaseDir = function(netlifyConfigPath) {
  if (netlifyConfigPath === undefined) {
    return cwd()
  }

  return path.dirname(netlifyConfigPath)
}

module.exports = { loadConfig }
