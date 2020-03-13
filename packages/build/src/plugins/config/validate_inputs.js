const { fail } = require('../error')
const { indent } = require('../../log/serialize')

const { validateFromSchema } = require('./json_schema')

// Validate `inputs` against JSON schema
// `config` is backward compatibility with former name.
// TODO: remove `config` after going out of beta.
const validateInputs = function({ config, inputs: inputsSchema = config }, { inputs }) {
  if (inputsSchema === undefined) {
    return
  }

  // We default `additionalProperties` to `false`, i.e. users get notified on unknown properties.
  // Plugin authors can override this by setting it to `true`.
  const errorMessage = validateFromSchema({ additionalProperties: false, ...inputsSchema }, inputs)

  if (errorMessage !== undefined) {
    fail(
      `Plugin inputs are invalid.
${errorMessage}

${indent(JSON.stringify(inputs, null, 2))}
`,
    )
  }

  // Ajv modifies `inputs` to assign default values and coerce types
  return inputs
}

module.exports = { validateInputs }
