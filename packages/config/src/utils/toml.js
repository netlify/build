import { parse as loadToml } from 'toml'
import tomlify from 'tomlify-j0.4'

// Parse from TOML to JavaScript
export const parseToml = function (configString) {
  const config = loadToml(configString)
  // `toml.parse()` returns a object with `null` prototype deeply, which can
  // sometimes create problems with some utilities. We convert it.
  // TOML can return Date instances, but JSON will stringify those, and we
  // don't use Date in netlify.toml, so this should be ok.
  return JSON.parse(JSON.stringify(config))
}

// Serialize JavaScript object to TOML
export const serializeToml = function (object) {
  return tomlify.toToml(object, { space: 2, replace: replaceTomlValue })
}

// `tomlify-j0.4` serializes integers as floats, e.g. `200.0`.
// This is a problem with `redirects[*].status`.
const replaceTomlValue = function (key, value) {
  return Number.isInteger(value) ? String(value) : false
}
