const isPlainObj = require('is-plain-obj')
const indentString = require('indent-string')
const deepmerge = require('deepmerge')

const { validateSchemaSyntax } = require('./json_schema')

// Validate `plugin.config`
const validateConfigSchema = function(configSchema) {
  if (!isPlainObj(configSchema)) {
    throwConfigError(configSchema, 'It must be a plain object.\n')
  }

  // Common mistake: {foo:{}} instead of {properties:{foo:{}}}
  if (Object.keys(configSchema).length !== 0 && configSchema.properties === undefined) {
    throwConfigError(configSchema, '')
  }

  const schema = deepmerge({}, configSchema)
  const errorMessage = validateSchemaSyntax(schema)
  if (errorMessage !== undefined) {
    throwConfigError(configSchema, `${errorMessage}\n`)
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
