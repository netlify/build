const { load: loadYaml, JSON_SCHEMA } = require('js-yaml')
const { parse: loadToml } = require('toml')

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
const PARSERS = {
  yaml: parseYaml,
  yml: parseYaml,
  toml: parseToml,
  json: parseJson,
}

module.exports = { PARSERS }
