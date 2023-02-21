import { fileURLToPath } from 'url'

import Ajv from 'ajv'
import glob from 'fast-glob'
import { describe, expect, test } from 'vitest'

import { FRAMEWORK_NAMES } from '../src/generated/frameworkNames.js'
import { FRAMEWORKS } from '../src/generated/frameworks.js'

const FRAMEWORKS_DIR = new URL('../src/frameworks/', import.meta.url)

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

const PLUGIN_SCHEMA = {
  type: 'object',
  required: ['packageName', 'condition'],
  additionalProperties: false,
  properties: {
    packageName: { type: 'string', minLength: 1 },
    condition: { type: 'object' },
  },
}

const POLLING_STRATEGY_SCHEMA = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { enum: ['TCP', 'HTTP'] },
  },
}

const MAX_PORT = 65_535
const FRAMEWORK_JSON_SCHEMA = {
  type: 'object',
  required: ['id', 'name', 'category', 'detect', 'dev', 'build', 'env'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', pattern: '^[a-z\\d_]+', minLength: 1 },
    name: { type: 'string', pattern: '^\\w+', minLength: 1 },
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
      oneOf: [
        {
          type: 'object',
          required: ['command'],
          additionalProperties: false,
          properties: {
            command: COMMAND_SCHEMA,
            port: { type: 'integer', minimum: 1, maximum: MAX_PORT },
            pollingStrategies: {
              type: 'array',
              items: POLLING_STRATEGY_SCHEMA,
              minItems: 1,
              uniqueItems: true,
            },
          },
        },
        { type: 'object', additionalProperties: false, properties: {} },
      ],
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
    staticAssetsDirectory: {
      type: 'string',
    },
    env: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
    logo: {
      type: 'object',
      additionalProperties: false,
      properties: {
        default: { type: 'string' },
        light: { type: 'string' },
        dark: { type: 'string' },
      },
    },
    plugins: {
      type: 'array',
      items: PLUGIN_SCHEMA,
    },
  },
}

test.each(FRAMEWORKS)('Framework $id should have a valid shape', (framework) => {
  expect(validate(framework, FRAMEWORK_JSON_SCHEMA)).toBe(true)
})

describe('JSON files', async () => {
  const jsonFiles = await glob('*.json', { cwd: fileURLToPath(FRAMEWORKS_DIR) })

  test('each json file should be required in main.ts FRAMEWORKS', async () => {
    expect(FRAMEWORKS).toHaveLength(jsonFiles.length)
    FRAMEWORKS.forEach(({ id }) => {
      expect(jsonFiles).toContain(`${id}.json`)
    })
  })

  test('each json file should be listed in main.ts FRAMEWORK_NAMES', async () => {
    expect(FRAMEWORK_NAMES).toHaveLength(jsonFiles.length)
    FRAMEWORK_NAMES.forEach((id) => {
      expect(jsonFiles).toContain(`${id}.json`)
    })
  })
})
