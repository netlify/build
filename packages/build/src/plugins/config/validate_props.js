const indentString = require('indent-string')

const { parseOutputs } = require('../outputs/when')

const { validateFromSchema } = require('./json_schema')

// Validate `pluginConfig` against `config` JSON schema
const validatePluginConfig = function({ config: configSchema }, { pluginConfig }) {
  if (configSchema === undefined) {
    return
  }

  const { configSchema: configSchemaA } = parseOutputs(configSchema)
  // We default `additionalProperties` to `false`, i.e. users get notified on unknown properties.
  // Plugin authors can override this by setting it to `true`.
  const errorMessage = validateFromSchema({ additionalProperties: false, ...configSchemaA }, pluginConfig)

  if (errorMessage !== undefined) {
    throw new Error(
      `Plugin configuration is invalid.
${errorMessage}

${indentString(JSON.stringify(pluginConfig, null, 2), 2)}
`,
    )
  }

  // Ajv modifies `pluginConfig` to assign default values and coerce types
  return pluginConfig
}

module.exports = { validatePluginConfig }
