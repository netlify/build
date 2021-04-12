'use strict'

const test = require('ava')

const { runFixture } = require('../helpers/main')

test('build.command empty', async (t) => {
  await runFixture(t, 'command_empty')
})

test('Some properties can be capitalized', async (t) => {
  await runFixture(t, 'props_case')
})

test('Some properties can be capitalized even when merged with defaultConfig', async (t) => {
  const defaultConfig = JSON.stringify({
    Build: {
      Base: 'base',
      Command: 'gulp build default',
      Functions: 'functions',
      Edge_handlers: 'edgeHandlers',
      Ignore: 'doIgnore',
      Publish: 'publish',
      Environment: { TEST: 'test' },
      Processing: { css: { bundle: false } },
    },
  })
  await runFixture(t, 'props_case_default_config', { flags: { defaultConfig } })
})

test('Does not add build.commandOrigin config if there are none', async (t) => {
  await runFixture(t, 'empty')
})

test('Does not add build.commandOrigin config if command is empty', async (t) => {
  await runFixture(t, 'command_empty')
})

test('Add build.commandOrigin config if it came from netlify.toml', async (t) => {
  await runFixture(t, 'command_origin_config')
})

test('Add build.commandOrigin config if it came from contexts', async (t) => {
  await runFixture(t, 'command_origin_context')
})

test('Add build.commandOrigin ui if it came from defaultConfig', async (t) => {
  const defaultConfig = JSON.stringify({ build: { command: 'test' } })
  await runFixture(t, 'empty', { flags: { defaultConfig } })
})

test('Assign default functions if functions.directory is not defined and default directory exists', async (t) => {
  await runFixture(t, 'default_functions_not_defined')
})

test('Assign default functions if functions.directory is not defined and the legacy default directory exists', async (t) => {
  await runFixture(t, 'legacy_default_functions_not_defined')
})

test('Does not assign default functions if default functions directory does not exist', async (t) => {
  await runFixture(t, 'default_functions_not_defined_directory_not_found')
})

test('Does not assign default functions if functions.directory is defined', async (t) => {
  await runFixture(t, 'default_functions_defined')
})

test('Does not assign default functions if build.functions is defined', async (t) => {
  await runFixture(t, 'default_functions_defined_legacy')
})

test('Assign default edge-handlers if build.edge_handlers is not defined', async (t) => {
  await runFixture(t, 'default_handlers_not_defined')
})

test('Does not assign default edge-handlers if build.edge_handlers is defined', async (t) => {
  await runFixture(t, 'default_handlers_defined')
})

test('Normalizes function configurations defined at the top level', async (t) => {
  await runFixture(t, 'function_config_top_level')
})

test('Normalizes function configurations defined at different levels', async (t) => {
  await runFixture(t, 'function_config_all_levels')
})

test('Handles function configuration objects for functions with the same name as one of the configuration properties', async (t) => {
  await runFixture(t, 'function_config_ambiguous')
})

test('Merges plugins in netlify.toml and defaultConfig', async (t) => {
  const defaultConfig = JSON.stringify({
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
  })
  await runFixture(t, 'merge_netlify_toml_default', { flags: { defaultConfig } })
})

test('Merges context-specific plugins', async (t) => {
  await runFixture(t, 'merge_netlify_toml_context')
})

test('Context-specific plugins config is last in merged array', async (t) => {
  await runFixture(t, 'merge_netlify_toml_context_last')
})
