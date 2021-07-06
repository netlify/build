'use strict'

const { readFile } = require('fs')
const { promisify } = require('util')

const pathExists = require('path-exists')

const { throwUserError } = require('./error')
const { parseToml } = require('./utils/toml')

const pReadFile = promisify(readFile)

// Load the configuration file and parse it (TOML)
const parseConfig = async function (configPath) {
  if (configPath === undefined) {
    return {}
  }

  if (!(await pathExists(configPath))) {
    throwUserError('Configuration file does not exist')
  }

  return await readConfigPath(configPath)
}

// Same but `configPath` is required and `configPath` might point to a
// non-existing file.
const parseOptionalConfig = async function (configPath) {
  if (!(await pathExists(configPath))) {
    return {}
  }

  return await readConfigPath(configPath)
}

const readConfigPath = async function (configPath) {
  const configString = await readConfig(configPath)

  try {
    return parseToml(configString)
  } catch (error) {
    throwUserError('Could not parse configuration file', error)
  }
}

// Reach the configuration file's raw content
const readConfig = async function (configPath) {
  try {
    return await pReadFile(configPath, 'utf8')
  } catch (error) {
    throwUserError('Could not read configuration file', error)
  }
}

module.exports = { parseConfig, parseOptionalConfig }
