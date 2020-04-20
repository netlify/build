const tomlify = require('tomlify-j0.4')

// Serialize JavaScript object to TOML
const serializeToml = function(object) {
  return tomlify.toToml(object, { space: 2 })
}

module.exports = { serializeToml }
