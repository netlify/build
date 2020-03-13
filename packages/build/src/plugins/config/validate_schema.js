const isPlainObj = require('is-plain-obj')
const deepmerge = require('deepmerge')

const { fail } = require('../error')
const { indent } = require('../../log/serialize')

const { validateSchemaSyntax } = require('./json_schema')

// Validate `plugin.inputs` itself
const validateInputsSchema = function(inputsSchema) {
  if (!isPlainObj(inputsSchema)) {
    throwInputsError(inputsSchema, 'It must be a plain object.\n')
  }

  // Common mistake: {foo:{}} instead of {properties:{foo:{}}}
  if (Object.keys(inputsSchema).length !== 0 && inputsSchema.properties === undefined) {
    throwInputsError(inputsSchema, '')
  }

  const schema = deepmerge({}, inputsSchema)
  const errorMessage = validateSchemaSyntax(schema)
  if (errorMessage !== undefined) {
    throwInputsError(inputsSchema, `${errorMessage}\n`)
  }
}

const throwInputsError = function(inputsSchema, errorMessage) {
  fail(`Plugin 'inputs' must be a JSON schema v7 describing each input.
${errorMessage}
${indent(JSON.stringify(inputsSchema, null, 2))}

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

module.exports = { validateInputsSchema }
