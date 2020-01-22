const isPlainObj = require('is-plain-obj')
const indentString = require('indent-string')
const deepmerge = require('deepmerge')

const { parseOutputs } = require('../outputs/when')

const { validateSchemaSyntax } = require('./json_schema')

// Validate `plugin.config`
const validateConfigSchema = function(configSchema) {
  if (!isPlainObj(configSchema)) {
    throwConfigError(configSchema, 'It must be a plain object.\n')
  }

  // Common mistake: {foo:{}} instead of {properties:{foo:{}}}
  const { properties } = configSchema
  if (
    (Object.keys(configSchema).length !== 0 && properties === undefined) ||
    (properties !== undefined && !isPlainObj(properties))
  ) {
    throwConfigError(configSchema, '')
  }

  const { configSchema: configSchemaA } = parseOutputs(configSchema)

  const schema = deepmerge({}, configSchemaA)
  const errorMessage = validateSchemaSyntax(schema)
  if (errorMessage !== undefined) {
    throwConfigError(configSchemaA, `${errorMessage}\n`)
  }
}

const throwConfigError = function(configSchema, errorMessage) {
  throw new Error(`Plugin 'config' must be a JSON schema v7 describing each configuration property.
${errorMessage}
${indentString(JSON.stringify(configSchema, null, 2), 2)}

Example:

  {
    required: ["foo"],
    properties: {
      foo: { type: "string" },
      bar: { type: "boolean" }
    }
  }

Learn more about JSON schema at https://json-schema.org/understanding-json-schema/`)
}

module.exports = { validateConfigSchema }
