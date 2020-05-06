const { yellowBright } = require('chalk')
const { load: loadYaml, JSON_SCHEMA } = require('js-yaml')
const { parse: loadToml } = require('toml')

const { serializeToml } = require('../utils/toml.js')

const parseYaml = function(configString) {
  return loadYaml(configString, { schema: JSON_SCHEMA, json: true })
}

const parseToml = function(configString) {
  const config = loadToml(configString)
  // `toml.parse()` returns a object with `null` prototype deeply, which can
  // sometimes create problems with some utilities. We convert it.
  // TOML can return Date instances, but JSON will stringify those, and we
  // don't use Date in netlify.toml, so this should be ok.
  return JSON.parse(JSON.stringify(config))
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
// We print the user's configuration file converted to `netlify.toml` so they
// don't have to do it themselves.
// TODO: remove after out of beta
const fixBackwardCompat = async function(config, extension) {
  if (extension === 'toml') {
    return
  }

  const exampleConfig = getExampleConfig(config)
  console.warn(yellowBright(`netlify.${extension} is deprecated: please use netlify.toml instead.\n${exampleConfig}`))
}

const getExampleConfig = function(config) {
  try {
    const tomlConfig = serializeToml(config)
    return `Example of what your netlify.toml should look like:\n\n${tomlConfig}`
    // Some YAML is not serializable to TOML. In that case, we silently give up
    // trying to convert it. Very unlikely.
  } catch (error) {
    return ''
  }
}

module.exports = { PARSERS, fixBackwardCompat }
