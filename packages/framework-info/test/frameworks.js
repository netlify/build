const Ajv = require('ajv')
const test = require('ava')
const { each } = require('test-each')

const { FRAMEWORKS } = require('../src/frameworks/main.js')

const ajv = new Ajv({})

const validate = function(value, schema) {
  const isValid = ajv.validate(schema, value)

  if (isValid) {
    return true
  }

  return ajv.errorsText(ajv.errors, { separator: '\n' })
}

const RELATIVE_PATH_SCHEMA = {
  type: 'string',
  minLength: 1,
  allOf: [{ not: { pattern: '^/' } }, { not: { pattern: '^\\.\\.?\\/' } }]
}
const FRAMEWORK_JSON_SCHEMA = {
  type: 'object',
  required: [
    'name',
    'category',
    'npmDependencies',
    'excludedNpmDependencies',
    'configFiles',
    'watchCommand',
    'watchPackageScripts',
    'publish',
    'port',
    'env'
  ],
  additionalProperties: false,
  properties: {
    name: { type: 'string', pattern: '^[a-z\\d_]+', minLength: 1 },
    category: {
      type: 'string',
      enum: ['static_site_generator', 'frontend_framework', 'build_tool']
    },
    npmDependencies: {
      type: 'array',
      items: { type: 'string', minLength: 1 }
    },
    excludedNpmDependencies: {
      type: 'array',
      items: { type: 'string', minLength: 1 }
    },
    configFiles: {
      type: 'array',
      items: RELATIVE_PATH_SCHEMA
    },
    watchCommand: { type: 'string', minLength: 1 },
    watchPackageScripts: {
      type: 'array',
      items: { type: 'string', minLength: 1 }
    },
    publish: RELATIVE_PATH_SCHEMA,
    port: { type: 'integer', minimum: 1, maximum: 65535 },
    env: {
      type: 'object',
      additionalProperties: { type: 'string' }
    }
  }
}

each(FRAMEWORKS, (info, framework) => {
  test(`Framework "${framework.name}" should have a valid shape`, t => {
    t.is(validate(framework, FRAMEWORK_JSON_SCHEMA), true)
  })
})
