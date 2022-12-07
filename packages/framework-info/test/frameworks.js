const fs = require('fs')
const path = require('path')
const util = require('util')

const Ajv = require('ajv').default
const test = require('ava')
const { each } = require('test-each')

const { FRAMEWORKS } = require('../src/frameworks/main.js')

const pReadDir = util.promisify(fs.readdir)
const pReadFile = util.promisify(fs.readFile)

const ajv = new Ajv({})

const validate = function (value, schema) {
  const isValid = ajv.validate(schema, value)

  if (isValid) {
    return true
  }

  return ajv.errorsText(ajv.errors, { separator: '\n' })
}

const RELATIVE_PATH_SCHEMA = {
  type: 'string',
  minLength: 1,
  allOf: [{ not: { pattern: '^/' } }, { not: { pattern: '^\\.\\.?\\/' } }],
}

const COMMAND_SCHEMA = {
  type: 'string',
  minLength: 1,
}

const MAX_PORT = 65535
const FRAMEWORK_JSON_SCHEMA = {
  type: 'object',
  required: ['name', 'category', 'detect', 'dev', 'build', 'env'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', pattern: '^[a-z\\d_]+', minLength: 1 },
    category: {
      type: 'string',
      enum: ['static_site_generator', 'frontend_framework', 'build_tool'],
    },
    detect: {
      type: 'object',
      required: ['npmDependencies', 'excludedNpmDependencies', 'configFiles'],
      additionalProperties: false,
      properties: {
        npmDependencies: {
          type: 'array',
          items: { type: 'string', minLength: 1 },
        },
        excludedNpmDependencies: {
          type: 'array',
          items: { type: 'string', minLength: 1 },
        },
        configFiles: {
          type: 'array',
          items: RELATIVE_PATH_SCHEMA,
        },
      },
    },
    dev: {
      type: 'object',
      dependencies: { command: ['port'], port: ['command'] },
      additionalProperties: false,
      properties: {
        command: COMMAND_SCHEMA,
        port: { type: 'integer', minimum: 1, maximum: MAX_PORT },
      },
    },
    build: {
      type: 'object',
      required: ['command', 'directory'],
      additionalProperties: false,
      properties: {
        command: COMMAND_SCHEMA,
        directory: RELATIVE_PATH_SCHEMA,
      },
    },
    env: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
  },
}

each(FRAMEWORKS, (info, framework) => {
  test(`Framework "${framework.name}" should have a valid shape`, (t) => {
    t.is(validate(framework, FRAMEWORK_JSON_SCHEMA), true)
  })
})

test('each json file should be required in main.js FRAMEWORKS', async (t) => {
  const dir = `${__dirname}/../src/frameworks`
  const jsonFiles = (await pReadDir(dir)).filter((file) => path.extname(file) === '.json')

  const mainFile = await pReadFile(`${dir}/main.js`, 'utf8')

  const missing = jsonFiles.filter((file) => !mainFile.includes(`./${file}`))
  t.deepEqual(missing, [])
})
