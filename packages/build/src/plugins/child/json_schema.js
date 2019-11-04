const Ajv = require('ajv')
const JSON_SCHEMA_SCHEMA = require('ajv/lib/refs/json-schema-draft-07.json')
const omit = require('omit.js')
const moize = require('moize').default

// Validate a value against a JSON schema
const mValidateFromSchema = function(schema, value, message) {
  const validate = ajv.compile(schema)
  const passed = validate(value)

  if (passed) {
    return
  }

  const [error] = validate.errors
  const errorMessage = Ajv.prototype.errorsText([error], { dataVar: '' }).replace(FIRST_CHAR_REGEXP, '')
  throw new Error(`${message}:\n${errorMessage}`)
}

const ajv = new Ajv({
  // AJV error messages can look overwhelming, so let's keep only the first one
  allErrors: false,
  format: 'full',
  // JSON schema allows unknown formats
  unknownFormats: 'ignore',
  // Make logging silent (e.g. warn on unknown format) but throws on errors
  logger: {
    log() {},
    warn() {},
    error(message) {
      throw message
    },
  },
  strictDefaults: true,
  strictKeywords: true,
  useDefaults: 'empty',
  coerceTypes: 'array',
})

const FIRST_CHAR_REGEXP = /^[. ]/

// Compilation is automatically memoized by `ajv` but not validation
const validateFromSchema = moize(mValidateFromSchema, { isDeepEqual: true })

// Validate JSON schema v7 syntax
const validateSchemaSyntax = function(schema, propName) {
  const jsonSchemaSchema = omit(JSON_SCHEMA_SCHEMA, ['id', '$id', '$schema', 'default'])
  return validateFromSchema(
    jsonSchemaSchema,
    schema,
    `${propName} is not a valid JSON schema (version 7)\n(learn more about JSON schema at https://json-schema.org/understanding-json-schema/)`,
  )
}

module.exports = { validateFromSchema, validateSchemaSyntax }
