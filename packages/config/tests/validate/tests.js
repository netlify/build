import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('plugins: not array', async (t) => {
  const output = await new Fixture('./fixtures/plugins_not_array').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins: not array of objects', async (t) => {
  const output = await new Fixture('./fixtures/plugins_not_objects').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins: do not allow duplicates', async (t) => {
  const output = await new Fixture('./fixtures/plugins_duplicate').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins: do not allow duplicates in the UI', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ defaultConfig: { plugins: [{ package: 'test' }, { package: 'test' }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any: unknown property', async (t) => {
  const output = await new Fixture('./fixtures/plugins_unknown').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any.id backward compatibility', async (t) => {
  const output = await new Fixture('./fixtures/plugins_id_compat').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any.enabled removed', async (t) => {
  const output = await new Fixture('./fixtures/plugins_enabled').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any.package: required', async (t) => {
  const output = await new Fixture('./fixtures/plugins_package_required').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any.package: string', async (t) => {
  const output = await new Fixture('./fixtures/plugins_package_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any.package: should not include a version', async (t) => {
  const output = await new Fixture('./fixtures/plugins_package_version').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any.package: should not include a URI scheme', async (t) => {
  const output = await new Fixture('./fixtures/plugins_package_scheme').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any.pinned_version: string', async (t) => {
  const output = await new Fixture('./fixtures/plugins_pinned_version_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('plugins.any.inputs: object', async (t) => {
  const output = await new Fixture('./fixtures/plugins_inputs_object').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build: object', async (t) => {
  const output = await new Fixture('./fixtures/build_object').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.ignore: string', async (t) => {
  const output = await new Fixture('./fixtures/build_ignore_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.publish: string', async (t) => {
  const output = await new Fixture('./fixtures/build_publish_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.publish: parent directory', async (t) => {
  const output = await new Fixture('./fixtures/build_publish_parent').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.publish: can be outside of build directory', async (t) => {
  const output = await new Fixture('./fixtures/build_publish_parent_build').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.publish: cannot be outside of root repository', async (t) => {
  const output = await new Fixture('./fixtures/build_publish_parent_root').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.functions: string', async (t) => {
  const output = await new Fixture('./fixtures/build_functions_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.functions: parent directory', async (t) => {
  const output = await new Fixture('./fixtures/build_functions_parent').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.edge_functions: string', async (t) => {
  const output = await new Fixture('./fixtures/build_edge_functions_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.edge_functions: parent directory', async (t) => {
  const output = await new Fixture('./fixtures/build_edge_functions_parent').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.base: string', async (t) => {
  const output = await new Fixture('./fixtures/build_base_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.base: parent directory', async (t) => {
  const output = await new Fixture('./fixtures/build_base_parent').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.command: string', async (t) => {
  const output = await new Fixture('./fixtures/build_command_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.command: array', async (t) => {
  const output = await new Fixture('./fixtures/build_command_array').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.command is validated even when not used due to merging', async (t) => {
  const output = await new Fixture('./fixtures/build_command_merge')
    .withFlags({ defaultConfig: { build: { command: false } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.context: property', async (t) => {
  const output = await new Fixture('./fixtures/build_context_property')
    .withFlags({ context: 'development' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.context: nested property', async (t) => {
  const output = await new Fixture('./fixtures/build_context_nested_property')
    .withFlags({ context: 'development' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.context: object', async (t) => {
  const output = await new Fixture('./fixtures/build_context_object').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.context.CONTEXT: object', async (t) => {
  const output = await new Fixture('./fixtures/build_context_nested_object').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.context properties are validated like top-level ones', async (t) => {
  const output = await new Fixture('./fixtures/build_context_validation').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.context properties are validated like top-level ones even on different context', async (t) => {
  const output = await new Fixture('./fixtures/build_context_validation')
    .withFlags({ context: 'development' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Warns when using UI plugins together with context-specific plugin configuration', async (t) => {
  const output = await new Fixture('./fixtures/build_context_plugins_warn')
    .withFlags({ defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not warn when using context-free plugin configuration together with context-specific plugin configuration', async (t) => {
  const output = await new Fixture('./fixtures/build_context_plugins_nowarn_global').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not warn when using no context-free plugin configuration together with context-specific plugin configuration', async (t) => {
  const output = await new Fixture('./fixtures/build_context_plugins_nowarn_none').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Throws when using UI plugins together with context-specific plugin configuration in a different context', async (t) => {
  const output = await new Fixture('./fixtures/build_context_plugins_warn')
    .withFlags({ context: 'development', defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not throw when using UI plugins together with context-specific plugin configuration in a different context but with inputs', async (t) => {
  const output = await new Fixture('./fixtures/build_context_plugins_warn_inputs')
    .withFlags({ context: 'development', defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('functions: object', async (t) => {
  const output = await new Fixture('./fixtures/function_config_invalid_root').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('functions block: object', async (t) => {
  const output = await new Fixture('./fixtures/function_config_invalid_function_block').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('functions.external_node_modules: array of strings', async (t) => {
  const output = await new Fixture('./fixtures/function_config_invalid_external_modules').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('functions.included_files: is array of strings', async (t) => {
  const output = await new Fixture('./fixtures/function_config_invalid_included_files').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('functions.ignored_node_modules: array of strings', async (t) => {
  const output = await new Fixture('./fixtures/function_config_invalid_ignored_modules').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('functions.node_bundler: one of supported bundlers', async (t) => {
  const output = await new Fixture('./fixtures/function_config_invalid_node_bundler').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('functions.directory: defined on the main functions object', async (t) => {
  const output = await new Fixture('./fixtures/function_config_invalid_nested_directory').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('functions.deno_import_map: string', async (t) => {
  const output = await new Fixture('./fixtures/functions_deno_import_map').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Validates defaultConfig', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ defaultConfig: { build: { command: false } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Validates inlineConfig', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ inlineConfig: { build: { command: false } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions: not array', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_not_array').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions: not array of objects', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_not_array_of_objects').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any: unknown properties', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_unknown_props').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any: missing properties', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_missing_props').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.path: invalid path', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_invalid_path').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.excludedPath: invalid path', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_excluded_path_invalid').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.test: pattern and path are exclusive', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_pattern_path_exclusive').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.test: excludedPattern and excludedPath are exclusive', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_excluded_pattern_path_exclusive').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.function: not a string', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_not_a_string').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.mode: allowed values', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_mode_allowed').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.mode: disallowed values', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_mode_disallowed').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.method: disallowed values', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_method_disallowed').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.header: allowed values', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_header_allowed').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('edge_functions.any.header: disallowed values', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_header_disallowed').runWithConfig()
  t.snapshot(normalizeOutput(output))
})
