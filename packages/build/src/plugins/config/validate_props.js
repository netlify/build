const { fail } = require('../error')
const { indent } = require('../../log/serialize')

const { validateFromSchema } = require('./json_schema')

// Validate `pluginConfig` against `config` JSON schema
const validatePluginConfig = function({ config: configSchema }, { pluginConfig }) {
  if (configSchema === undefined) {
    return
  }

  // We default `additionalProperties` to `false`, i.e. users get notified on unknown properties.
  // Plugin authors can override this by setting it to `true`.
  const errorMessage = validateFromSchema({ additionalProperties: false, ...configSchema }, pluginConfig)

  if (errorMessage !== undefined) {
    fail(
      `Plugin configuration is invalid.
${errorMessage}

${indent(JSON.stringify(pluginConfig, null, 2))}
`,
    )
  }

  // Ajv modifies `pluginConfig` to assign default values and coerce types
  return pluginConfig
}

module.exports = { validatePluginConfig }
