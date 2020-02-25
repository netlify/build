const Ajv = require('ajv')
const JSON_SCHEMA_SCHEMA = require('ajv/lib/refs/json-schema-draft-07.json')
const omit = require('omit.js')
const moize = require('moize').default

const { fail } = require('../error')

// Validate a value against a JSON schema
const mValidateFromSchema = function(schema, value) {
  const validate = ajv.compile(schema)
  const passed = validate(value)

  if (passed) {
    return
  }

  const [error] = validate.errors
  const errorMessage = Ajv.prototype.errorsText([error], { dataVar: '' }).replace(FIRST_CHAR_REGEXP, '')
  return errorMessage
}

const ajv = new Ajv({
  // AJV error messages can look overwhelming, so let's keep only the first one
  allErrors: false,
  format: 'full',
  // JSON schema allows unknown formats
  unknownFormats: 'ignore',
  // Make logging silent (e.g. warn on unknown format) but throws on errors
  logger: {
    // istanbul ignore next
    log() {},
    // istanbul ignore next
    warn() {},
    // istanbul ignore next
    error(message) {
      fail(message)
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
const validateSchemaSyntax = function(schema) {
  const jsonSchemaSchema = omit(JSON_SCHEMA_SCHEMA, ['$id', 'default'])
  return validateFromSchema(jsonSchemaSchema, schema)
}

module.exports = { validateFromSchema, validateSchemaSyntax }
