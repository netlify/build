'use strict'

const { throwError } = require('../error')

// Validate that plugin are configured only once per origin
// (`netlify.toml` or UI).
// Exception: context-specific configuration since we allow context-specific
// overrides. This does not validate them since contexts have not been merged
// yet.
const validateIdenticalPlugins = function ({ plugins = [] }) {
  plugins.filter(hasIdenticalPlugin).forEach(throwIndenticalPlugin)
}

const hasIdenticalPlugin = function ({ package: packageName, origin }, index, plugins) {
  return plugins.slice(index + 1).some((pluginA) => packageName === pluginA.package && origin === pluginA.origin)
}

const throwIndenticalPlugin = function ({ package: packageName, origin }) {
  throwError(`Plugin "${packageName}" must not be specified twice in ${ORIGINS[origin]}`)
}

const ORIGINS = { config: 'netlify.toml', ui: 'the app' }

module.exports = { validateIdenticalPlugins }
