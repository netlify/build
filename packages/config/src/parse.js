'use strict'

const { readFile } = require('fs')
const { promisify } = require('util')

const pathExists = require('path-exists')

const { throwUserError } = require('./error')
const { throwOnInvalidTomlSequence } = require('./log/messages')
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

  validateTomlBlackslashes(configString)

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

const validateTomlBlackslashes = function (configString) {
  const result = INVALID_TOML_BLACKSLASH.exec(configString)
  if (result === null) {
    return
  }

  const [, invalidTripleSequence, invalidSequence = invalidTripleSequence] = result
  throwOnInvalidTomlSequence(invalidSequence)
}

// The TOML specification forbids unrecognized backslash sequences. However,
// `toml-node` does not respect the specification and do not fail on those.
// Therefore, we print a warning message.
// This only applies to " and """ strings, not ' nor '''
// Also, """ strings can use trailing backslashes.
const INVALID_TOML_BLACKSLASH =
  /\n[a-zA-Z]+ *= *(?:(?:""".*(?<!\\)(\\[^"\\btnfruU\n]).*""")|(?:"(?!")[^\n]*(?<!\\)(\\[^"\\btnfruU])[^\n]*"))/su

module.exports = { parseConfig, parseOptionalConfig }
