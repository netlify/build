'use strict'

const test = require('ava')

const { runFixture } = require('../helpers/main')

test('plugins: not array', async (t) => {
  await runFixture(t, 'plugins_not_array')
})

test('plugins: not array of objects', async (t) => {
  await runFixture(t, 'plugins_not_objects')
})

test('plugins: do not allow duplicates', async (t) => {
  await runFixture(t, 'plugins_duplicate')
})

test('plugins: do not allow duplicates in the UI', async (t) => {
  const defaultConfig = { plugins: [{ package: 'test' }, { package: 'test' }] }
  await runFixture(t, 'empty', { flags: { defaultConfig } })
})

test('plugins.any: unknown property', async (t) => {
  await runFixture(t, 'plugins_unknown')
})

test('plugins.any.id backward compatibility', async (t) => {
  await runFixture(t, 'plugins_id_compat')
})

test('plugins.any.enabled removed', async (t) => {
  await runFixture(t, 'plugins_enabled')
})

test('plugins.any.package: required', async (t) => {
  await runFixture(t, 'plugins_package_required')
})

test('plugins.any.package: string', async (t) => {
  await runFixture(t, 'plugins_package_string')
})

test('plugins.any.package: should not include a version', async (t) => {
  await runFixture(t, 'plugins_package_version')
})

test('plugins.any.package: should not include a URI scheme', async (t) => {
  await runFixture(t, 'plugins_package_scheme')
})

test('plugins.any.pinned_version: string', async (t) => {
  await runFixture(t, 'plugins_pinned_version_string')
})

test('plugins.any.inputs: object', async (t) => {
  await runFixture(t, 'plugins_inputs_object')
})

test('build: object', async (t) => {
  await runFixture(t, 'build_object')
})

test('build.publish: string', async (t) => {
  await runFixture(t, 'build_publish_string')
})

test('build.publish: parent directory', async (t) => {
  await runFixture(t, 'build_publish_parent')
})

test('build.functions: string', async (t) => {
  await runFixture(t, 'build_functions_string')
})

test('build.functions: parent directory', async (t) => {
  await runFixture(t, 'build_functions_parent')
})

test('build.edge_handlers: string', async (t) => {
  await runFixture(t, 'build_edge_handlers_string')
})

test('build.edge_handlers: parent directory', async (t) => {
  await runFixture(t, 'build_edge_handlers_parent')
})

test('build.base: string', async (t) => {
  await runFixture(t, 'build_base_string')
})

test('build.base: parent directory', async (t) => {
  await runFixture(t, 'build_base_parent')
})

test('build.command: string', async (t) => {
  await runFixture(t, 'build_command_string')
})

test('build.command: array', async (t) => {
  await runFixture(t, 'build_command_array')
})

test('build.command is validated even when not used due to merging', async (t) => {
  const defaultConfig = { build: { command: false } }
  await runFixture(t, 'build_command_merge', { flags: { defaultConfig } })
})

test('build.context: property', async (t) => {
  await runFixture(t, 'build_context_property', { flags: { context: 'development' } })
})

test('build.context: nested property', async (t) => {
  await runFixture(t, 'build_context_nested_property', { flags: { context: 'development' } })
})

test('build.context: object', async (t) => {
  await runFixture(t, 'build_context_object')
})

test('build.context.CONTEXT: object', async (t) => {
  await runFixture(t, 'build_context_nested_object')
})

test('build.context properties are validated like top-level ones', async (t) => {
  await runFixture(t, 'build_context_validation')
})

test('build.context properties are validated like top-level ones even on different context', async (t) => {
  await runFixture(t, 'build_context_validation', { flags: { context: 'development' } })
})

test('Warns when using UI plugins together with context-specific plugin configuration', async (t) => {
  await runFixture(t, 'build_context_plugins_warn', {
    flags: { defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } },
  })
})

test('Does not warn when using context-free plugin configuration together with context-specific plugin configuration', async (t) => {
  await runFixture(t, 'build_context_plugins_nowarn_global')
})

test('Does not warn when using no context-free plugin configuration together with context-specific plugin configuration', async (t) => {
  await runFixture(t, 'build_context_plugins_nowarn_none')
})

test('Throws when using UI plugins together with context-specific plugin configuration in a different context', async (t) => {
  await runFixture(t, 'build_context_plugins_warn', {
    flags: { context: 'development', defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } },
  })
})

test('Does not throw when using UI plugins together with context-specific plugin configuration in a different context but with inputs', async (t) => {
  await runFixture(t, 'build_context_plugins_warn_inputs', {
    flags: { context: 'development', defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } },
  })
})

test('functions: object', async (t) => {
  await runFixture(t, 'function_config_invalid_root')
})

test('functions block: object', async (t) => {
  await runFixture(t, 'function_config_invalid_function_block')
})

test('functions.external_node_modules: array of strings', async (t) => {
  await runFixture(t, 'function_config_invalid_external_modules')
})

test('functions.ignored_node_modules: array of strings', async (t) => {
  await runFixture(t, 'function_config_invalid_ignored_modules')
})

test('functions.node_bundler: one of supported bundlers', async (t) => {
  await runFixture(t, 'function_config_invalid_node_bundler')
})

test('functions.directory: defined on the main functions object', async (t) => {
  await runFixture(t, 'function_config_invalid_nested_directory')
})

test('Validates defaultConfig', async (t) => {
  const defaultConfig = { build: { command: false } }
  await runFixture(t, 'empty', { flags: { defaultConfig } })
})

test('Validates inlineConfig', async (t) => {
  const inlineConfig = { build: { command: false } }
  await runFixture(t, 'empty', { flags: { inlineConfig } })
})
