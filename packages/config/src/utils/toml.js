'use strict'

const { parse: loadToml } = require('toml')
const tomlify = require('tomlify-j0.4')

// Parse from TOML to JavaScript
const parseToml = function (configString) {
  const config = loadToml(configString)
  // `toml.parse()` returns a object with `null` prototype deeply, which can
  // sometimes create problems with some utilities. We convert it.
  // TOML can return Date instances, but JSON will stringify those, and we
  // don't use Date in netlify.toml, so this should be ok.
  return JSON.parse(JSON.stringify(config))
}

// Serialize JavaScript object to TOML
const serializeToml = function (object) {
  return tomlify.toToml(object, { space: 2 })
}

module.exports = { parseToml, serializeToml }
