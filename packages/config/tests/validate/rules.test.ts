import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

const INVALID_CONFIG_FIXTURES = [
  ['functions.*.memory: number or string', 'function_config_invalid_memory'],
  ['functions.*.region: string', 'function_config_invalid_region'],
  ['functions.*.vcpu: number between 0.5 and 2', 'function_config_invalid_vcpu'],
  ['functions.*.vcpu: not below 0.5', 'function_config_invalid_vcpu_below_min'],
  ['functions.*.schedule: cron expression', 'function_config_invalid_schedule'],
  ['functions.directory: string', 'functions_directory_not_string'],
  ['database: object', 'database_not_object'],
  ['database.migrations: object', 'database_migrations_not_object'],
  ['database.migrations.path: string', 'database_migrations_path_not_string'],
  ['edge_functions.any.path: string', 'edge_functions_path_not_string'],
  ['edge_functions.any.pattern: string', 'edge_functions_pattern_not_string'],
  ['edge_functions.any.excludedPattern: string or array of strings', 'edge_functions_excluded_pattern_invalid'],
  ['edge_functions.any.name: string', 'edge_functions_name_not_string'],
] as const

test.each(INVALID_CONFIG_FIXTURES)('%s', async (_name, fixtureName) => {
  const output = await new Fixture(import.meta.url, `./fixtures/${fixtureName}`).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.generator: string, when set by another origin than netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ inlineConfig: { edge_functions: [{ path: '/hello', function: 'hello', generator: 1 }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions.*.memory, region, vcpu and schedule accept valid values', async () => {
  const { config } = (await new Fixture(
    import.meta.url,
    './fixtures/function_config_valid_resources',
  ).runWithConfigAsObject()) as { config: { functions: Record<string, Record<string, unknown>> } }

  expect(config.functions['*']).toMatchObject({ memory: '2gb', region: 'cmh' })
  expect(config.functions.small).toMatchObject({ memory: 512, vcpu: 0.5 })
  expect(config.functions.large).toMatchObject({ vcpu: 2, schedule: '5 4 * * *' })
})
