import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { Ajv, type SchemaObject } from 'ajv'
import { parse as loadToml } from 'smol-toml'
import { describe, expect, test } from 'vitest'

import { resolveConfig } from '../../src/main.js'

// The JSON schema published for `netlify.toml` must agree with the validation
// that `@netlify/config` performs. Every `netlify.toml` used by the tests of
// this package is run through both, and they must either both accept it or
// both reject it.

const SCHEMA_PATH = fileURLToPath(new URL('../../schema.json', import.meta.url))
const TESTS_DIR = fileURLToPath(new URL('..', import.meta.url))

// Fixtures on which the schema and the validation are expected to disagree,
// with the reason why. Each entry is checked to still disagree, so that it is
// removed once it no longer applies.
const KNOWN_DIFFERENCES: Partial<Record<string, string>> = {
  // Rules that depend on the file system, which a schema cannot see.
  'base/fixtures/base_invalid': 'checks that the base directory exists',
  'load/fixtures/merge_base': 'checks that the base directory exists',
  'validate/fixtures/build_base_parent': 'checks that the path is inside the repository',
  'validate/fixtures/build_edge_functions_parent': 'checks that the path is inside the repository',
  'validate/fixtures/build_functions_parent': 'checks that the path is inside the repository',
  'validate/fixtures/build_publish_parent': 'checks that the path is inside the repository',
  'validate/fixtures/build_publish_parent_root': 'checks that the path is inside the repository',

  // Rules that compare values with each other, which JSON schema cannot express.
  'validate/fixtures/plugins_duplicate': 'checks that plugins are unique by package',
  'validate/fixtures/server_scale_min_above_max': 'checks that `min` is not above `max`',

  // Cases where the schema is deliberately stricter.
  'normalize/fixtures/function_config_ambiguous': 'rejects functions named after a functions property',
  'parse/fixtures/headers_field_error': 'rejects invalid headers, which Netlify ignores with a warning',
}

const getFixtures = () =>
  readdirSync(TESTS_DIR, { withFileTypes: true })
    .filter((testDir) => testDir.isDirectory() && existsSync(join(TESTS_DIR, testDir.name, 'fixtures')))
    .flatMap((testDir) =>
      readdirSync(join(TESTS_DIR, testDir.name, 'fixtures')).map((fixture) => `${testDir.name}/fixtures/${fixture}`),
    )
    .filter((fixture) => existsSync(join(TESTS_DIR, fixture, 'netlify.toml')))

type ConfigFile = Record<string, unknown>

const loadConfigFile = (fixtureDir: string): ConfigFile | undefined => {
  try {
    // Convert `null` prototype objects to normal plain objects
    return JSON.parse(JSON.stringify(loadToml(readFileSync(join(fixtureDir, 'netlify.toml'), 'utf8')))) as ConfigFile
  } catch {
    // Files with TOML syntax errors are covered by the parse tests.
    return undefined
  }
}

// Most properties set in a context are only validated when that context is
// the one being built, whereas the schema validates all of them, so we
// resolve the configuration once per context.
const isAcceptedByNetlify = async (fixtureDir: string, config: ConfigFile) => {
  const contexts = config.context !== null && typeof config.context === 'object' ? Object.keys(config.context) : []

  for (const context of [undefined, ...contexts]) {
    try {
      await resolveConfig({ cwd: fixtureDir, repositoryRoot: fixtureDir, offline: true, buffer: true, context })
    } catch {
      return false
    }
  }

  return true
}

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')) as SchemaObject & { $id: string }
const validateSchema = new Ajv({ allErrors: true, allowUnionTypes: true, strict: true, strictRequired: false }).compile(
  schema,
)

describe('JSON schema', () => {
  test.each(getFixtures())('agrees with the validation on %s', async (fixture) => {
    const fixtureDir = join(TESTS_DIR, fixture)
    const config = loadConfigFile(fixtureDir)

    if (config === undefined) {
      return
    }

    const acceptedByNetlify = await isAcceptedByNetlify(fixtureDir, config)
    const acceptedBySchema = validateSchema(config)
    const knownDifference = KNOWN_DIFFERENCES[fixture]

    // The schema errors and the known difference are included so that they
    // show up in the diff when the assertion fails.
    expect({ acceptedBySchema, knownDifference, errors: validateSchema.errors ?? [] }).toMatchObject({
      acceptedBySchema: knownDifference === undefined ? acceptedByNetlify : !acceptedByNetlify,
    })
  })

  test('lists only existing fixtures as known differences', () => {
    expect(getFixtures()).toEqual(expect.arrayContaining(Object.keys(KNOWN_DIFFERENCES)))
  })

  test('accepts a `$schema` property', () => {
    expect(validateSchema({ $schema: schema.$id, build: { command: 'npm run build' } })).toBe(true)
  })
})
