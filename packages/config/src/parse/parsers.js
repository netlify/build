const { writeFile } = require('fs')
const { basename, dirname, join } = require('path')
const { promisify } = require('util')

const { yellowBright } = require('chalk')
const { load: loadYaml, JSON_SCHEMA } = require('js-yaml')
const { parse: loadToml } = require('toml')

const { serializeToml } = require('../utils/toml.js')

const pWriteFile = promisify(writeFile)

const parseYaml = function(configString) {
  return loadYaml(configString, { schema: JSON_SCHEMA, json: true })
}

const parseToml = function(configString) {
  return loadToml(configString)
}

const parseJson = function(configString) {
  return JSON.parse(configString)
}

// List of parsers for each file extension
// TODO: remove YAML and JSON after out of beta
const PARSERS = {
  yaml: parseYaml,
  yml: parseYaml,
  toml: parseToml,
  json: parseJson,
}

// YAML and JSON are deprecated.
// We convert user's configuration file to `netlify.toml` so they don't have to
// do it themselves.
// TODO: remove after out of beta
const fixBackwardCompat = async function(config, extension, configPath) {
  if (extension === 'toml') {
    return
  }

  console.warn(yellowBright(`netlify.${extension} is deprecated: please use netlify.toml instead.\n`))

  const tomlConfigPath = getTomlConfigPath(configPath, extension)
  const tomlConfig = getTomlConfig(config)

  if (tomlConfig === undefined) {
    return
  }

  await pWriteFile(tomlConfigPath, `${tomlConfig}\n`)
}

const getTomlConfig = function(config) {
  try {
    return serializeToml(config)
    // Some YAML is not serializable to TOML. In that case, we silently give up
    // trying to convert it
  } catch (error) {
    return
  }
}

const getTomlConfigPath = function(configPath, extension) {
  const filename = basename(configPath).replace(extension, 'toml')
  return join(dirname(configPath), filename)
}

module.exports = { PARSERS, fixBackwardCompat }
