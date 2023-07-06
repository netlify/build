import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('build.command empty', async (t) => {
  const output = await new Fixture('./fixtures/command_empty').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Some properties can be capitalized', async (t) => {
  const output = await new Fixture('./fixtures/props_case').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Some properties can be capitalized even when merged with defaultConfig', async (t) => {
  const output = await new Fixture('./fixtures/props_case_default_config')
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
  t.snapshot(normalizeOutput(output))
})

test('Does not add build.commandOrigin config if there are none', async (t) => {
  const output = await new Fixture('./fixtures/empty').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not add build.commandOrigin config if command is empty', async (t) => {
  const output = await new Fixture('./fixtures/command_empty').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Add build.commandOrigin config if it came from netlify.toml', async (t) => {
  const output = await new Fixture('./fixtures/command_origin_config').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Add build.commandOrigin config if it came from contexts', async (t) => {
  const output = await new Fixture('./fixtures/command_origin_context').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Add build.commandOrigin ui if it came from defaultConfig', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({
      defaultConfig: { build: { command: 'test' } },
    })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Assign default functions if functions.directory is not defined and default directory exists', async (t) => {
  const output = await new Fixture('./fixtures/default_functions_not_defined').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Assign default functions if functions.directory is not defined and the legacy default directory exists', async (t) => {
  const output = await new Fixture('./fixtures/legacy_default_functions_not_defined').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not assign default functions if default functions directory does not exist', async (t) => {
  const output = await new Fixture('./fixtures/default_functions_not_defined_directory_not_found').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not assign default functions if functions.directory is defined', async (t) => {
  const output = await new Fixture('./fixtures/default_functions_defined').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not assign default functions if build.functions is defined', async (t) => {
  const output = await new Fixture('./fixtures/default_functions_defined_legacy').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Gives priority to functions.star over functions when defined first', async (t) => {
  const output = await new Fixture('./fixtures/default_functions_star_priority_first').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Gives priority to functions.star over functions when defined last', async (t) => {
  const output = await new Fixture('./fixtures/default_functions_star_priority_last').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Assign default edge-functions if build.edge_functions is not defined', async (t) => {
  const output = await new Fixture('./fixtures/default_edge_functions_not_defined').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not assign default edge-functions if build.edge_functions is defined', async (t) => {
  const output = await new Fixture('./fixtures/default_edge_functions_defined').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Normalizes function configurations defined at the top level', async (t) => {
  const output = await new Fixture('./fixtures/function_config_top_level').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Normalizes function configurations defined at different levels', async (t) => {
  const output = await new Fixture('./fixtures/function_config_all_levels').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Handles function configuration objects for functions with the same name as one of the configuration properties', async (t) => {
  const output = await new Fixture('./fixtures/function_config_ambiguous').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Collects paths from `included_files` defined at different levels', async (t) => {
  const output = await new Fixture('./fixtures/function_config_included_files').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Merges plugins in netlify.toml and defaultConfig', async (t) => {
  const output = await new Fixture('./fixtures/merge_netlify_toml_default')
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
  t.snapshot(normalizeOutput(output))
})

test('Merges context-specific plugins', async (t) => {
  const output = await new Fixture('./fixtures/merge_netlify_toml_context').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context-specific plugins config is last in merged array', async (t) => {
  const output = await new Fixture('./fixtures/merge_netlify_toml_context_last').runWithConfig()
  t.snapshot(normalizeOutput(output))
})
