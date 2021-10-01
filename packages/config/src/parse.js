'use strict'

const { readFile } = require('fs')
const { promisify } = require('util')

const pathExists = require('path-exists')

const { throwUserError } = require('./error')
const { warnTomlBackslashes } = require('./log/messages')
const { parseToml } = require('./utils/toml')

const pReadFile = promisify(readFile)

// Load the configuration file and parse it (TOML)
const parseConfig = async function (configPath, logs, featureFlags) {
  if (configPath === undefined) {
    return {}
  }

  if (!(await pathExists(configPath))) {
    throwUserError('Configuration file does not exist')
  }

  return await readConfigPath(configPath, logs, featureFlags)
}

// Same but `configPath` is required and `configPath` might point to a
// non-existing file.
const parseOptionalConfig = async function (configPath, logs, featureFlags) {
  if (!(await pathExists(configPath))) {
    return {}
  }

  return await readConfigPath(configPath, logs, featureFlags)
}

const readConfigPath = async function (configPath, logs, featureFlags) {
  const configString = await readConfig(configPath)

  validateTomlBlackslashes(logs, configString, featureFlags)

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

const validateTomlBlackslashes = function (logs, configString, featureFlags) {
  if (!featureFlags.netlify_config_toml_backslash) {
    return
  }

  const result = INVALID_TOML_BLACKSLASH.exec(configString)
  if (result === null) {
    return
  }

  const [invalidSequence] = result
  warnTomlBackslashes(logs, invalidSequence)
}

// The TOML specification forbids unrecognized backslash sequences. However,
// `toml-node` does not respect the specification and do not fail on those.
// Therefore, we print a warning message.
const INVALID_TOML_BLACKSLASH = /(?<!\\)\\[^"\\btnfruU]/u

module.exports = { parseConfig, parseOptionalConfig }
