const { extname } = require('path')
const { readFile } = require('fs')
const { promisify } = require('util')

const pReadFile = promisify(readFile)

const { throwError } = require('../error')

const { PARSERS } = require('./parsers')

// Load the configuration file and parse it (YAML/JSON/TOML)
const parseConfig = async function(configPath) {
  if (configPath === undefined) {
    return {}
  }

  const configString = await readConfig(configPath)
  const parser = getParser(configPath)

  try {
    return parser(configString)
  } catch (error) {
    throwError(`Could not parse configuration file ${configPath}`, error)
  }
}

// Reach the configuration file's raw content
const readConfig = async function(configPath) {
  try {
    return await pReadFile(configPath, 'utf8')
  } catch (error) {
    throwError(`Could not read configuration file ${configPath}`, error)
  }
}

// Retrieve the syntax-specific function to parse the raw content
const getParser = function(configPath) {
  const extension = extname(configPath).replace('.', '')
  const parser = PARSERS[extension]

  if (parser === undefined) {
    throwError(`Unsupported file format "${extension}": ${configPath}`)
  }

  return parser
}

module.exports = { parseConfig }
