const { fail } = require('../error')
const { indent } = require('../../log/serialize')

const { validateFromSchema } = require('./json_schema')

// Validate `inputs` against `config` JSON schema
const validateInputs = function({ config: configSchema }, { inputs }) {
  if (configSchema === undefined) {
    return
  }

  // We default `additionalProperties` to `false`, i.e. users get notified on unknown properties.
  // Plugin authors can override this by setting it to `true`.
  const errorMessage = validateFromSchema({ additionalProperties: false, ...configSchema }, inputs)

  if (errorMessage !== undefined) {
    fail(
      `Plugin configuration is invalid.
${errorMessage}

${indent(JSON.stringify(inputs, null, 2))}
`,
    )
  }

  // Ajv modifies `inputs` to assign default values and coerce types
  return inputs
}

module.exports = { validateInputs }
