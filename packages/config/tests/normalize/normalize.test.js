import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

test('build.command empty', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/command_empty').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Some properties can be capitalized', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/props_case').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Some properties can be capitalized even when merged with defaultConfig', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/props_case_default_config')
    .withFlags({
      defaultConfig: {
        Build: {
          Base: 'base',
          Command: 'gulp build default',
          Edge_functions: 'edgeFunctions',
          Functions: 'functions',
          Ignore: 'doIgnore',
          Publish: 'publish',
          Environment: { TEST: 'test' },
          Processing: { css: { bundle: false } },
        },
      },
    })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not add build.commandOrigin config if there are none', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not add build.commandOrigin config if command is empty', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/command_empty').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Add build.commandOrigin config if it came from netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/command_origin_config').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Add build.commandOrigin config if it came from contexts', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/command_origin_context').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Add build.commandOrigin ui if it came from defaultConfig', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({
      defaultConfig: { build: { command: 'test' } },
    })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Assign default functions if functions.directory is not defined and default directory exists', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_functions_not_defined').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Assign default functions if functions.directory is not defined and the legacy default directory exists', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/legacy_default_functions_not_defined').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not assign default functions if default functions directory does not exist', async () => {
  const output = await new Fixture(
    import.meta.url,
    './fixtures/default_functions_not_defined_directory_not_found',
  ).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not assign default functions if functions.directory is defined', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_functions_defined').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not assign default functions if build.functions is defined', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_functions_defined_legacy').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Gives priority to functions.star over functions when defined first', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_functions_star_priority_first').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Gives priority to functions.star over functions when defined last', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_functions_star_priority_last').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Assign default edge-functions if build.edge_functions is not defined', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_edge_functions_not_defined').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not assign default edge-functions if build.edge_functions is defined', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_edge_functions_defined').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Normalizes function configurations defined at the top level', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function_config_top_level').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Normalizes function configurations defined at different levels', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function_config_all_levels').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Handles function configuration objects for functions with the same name as one of the configuration properties', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function_config_ambiguous').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Collects paths from `included_files` defined at different levels', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function_config_included_files').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Merges plugins in netlify.toml and defaultConfig', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/merge_netlify_toml_default')
    .withFlags({
      defaultConfig: {
        plugins: [
          {
            package: 'netlify-plugin-test',
            inputs: {
              boolean: true,
              unset: true,
              array: ['a', 'b'],
              object: { prop: true, unset: true },
            },
          },
        ],
      },
    })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Merges context-specific plugins', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/merge_netlify_toml_context').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Context-specific plugins config is last in merged array', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/merge_netlify_toml_context_last').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
