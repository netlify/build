const { readFile } = require('fs')
const { extname } = require('path')
const { promisify } = require('util')

const pathExists = require('path-exists')

const { throwError } = require('../error')

const { PARSERS, fixBackwardCompat } = require('./parsers')

const pReadFile = promisify(readFile)

// Load the configuration file and parse it (YAML/JSON/TOML)
const parseConfig = async function(configPath) {
  if (configPath === undefined) {
    return {}
  }

  if (!(await pathExists(configPath))) {
    throwError('Configuration file does not exist')
  }

  const configString = await readConfig(configPath)
  const extension = extname(configPath).replace('.', '')
  const parser = getParser(configPath, extension)

  try {
    const config = await parser(configString)
    await fixBackwardCompat(config, extension)
    return config
  } catch (error) {
    throwError('Could not parse configuration file', error)
  }
}

// Reach the configuration file's raw content
const readConfig = async function(configPath) {
  try {
    return await pReadFile(configPath, 'utf8')
  } catch (error) {
    throwError('Could not read configuration file', error)
  }
}

// Retrieve the syntax-specific function to parse the raw content
const getParser = function(configPath, extension) {
  const parser = PARSERS[extension]

  if (parser === undefined) {
    throwError(`Unsupported file format "${extension}"`)
  }

  return parser
}

module.exports = { parseConfig }
