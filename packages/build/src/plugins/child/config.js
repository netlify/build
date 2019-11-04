const isPlainObj = require('is-plain-obj')

const { validateFromSchema } = require('./json_schema')

// Validate `pluginConfig` against `config` JSON schema
const validatePluginConfig = function({ config: configSchema }, { pluginConfig = {} }) {
  if (configSchema === undefined) {
    return
  }

  if (!isPlainObj(pluginConfig)) {
    throw new Error(`Plugin 'config' must be an object`)
  }

  Object.entries(pluginConfig).forEach(([propName, value]) => validateProp(configSchema[propName], propName, value))

  // Ajv modifies `pluginConfig` to assign default values and coerce types
  return pluginConfig
}

const validateProp = function(schema, propName, value) {
  if (schema === undefined) {
    throw new Error(`Plugin config does not support any property named '${propName}'`)
  }

  validateFromSchema(schema, value, `Plugin 'config.${propName}: ${value}' is invalid`)
}

module.exports = { validatePluginConfig }
