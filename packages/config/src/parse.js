const { readFile } = require('fs')
const path = require('path')
const { promisify } = require('util')

const pathExists = require('path-exists')
const { parse: loadToml } = require('toml')

const { throwError } = require('./error')
const { parseHeadersFile } = require('./headers')

const pReadFile = promisify(readFile)

// Load the configuration file and parse it (TOML)
const parseConfig = async function(configPath) {
  if (configPath === undefined) {
    return {}
  }

  if (!(await pathExists(configPath))) {
    throwError('Configuration file does not exist')
  }

  const configString = await readConfig(configPath)

  try {
    const config = parseToml(configString)

    const headersFilePath = path.join(path.dirname(configPath), '_headers')
    if (!(await pathExists(headersFilePath))) {
      const fileHeaders = parseHeadersFile(headersFilePath)
      const configHeaders = config.headers || {}
      const paths = Array.from(new Set(Object.keys(configHeaders).concat(Object.keys(fileHeaders))))
      config.headers = paths.reduce((prev, k) => ({ ...prev, [k]: [...configHeaders[k], ...fileHeaders[k]] }), {})
    }

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

const parseToml = function(configString) {
  const config = loadToml(configString)
  // `toml.parse()` returns a object with `null` prototype deeply, which can
  // sometimes create problems with some utilities. We convert it.
  // TOML can return Date instances, but JSON will stringify those, and we
  // don't use Date in netlify.toml, so this should be ok.
  return JSON.parse(JSON.stringify(config))
}

module.exports = { parseConfig }
