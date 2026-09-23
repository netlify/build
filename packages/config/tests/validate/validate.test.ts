import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

test('plugins: not array', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_not_array').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins: not array of objects', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_not_objects').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins: do not allow duplicates', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_duplicate').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins: do not allow duplicates in the UI', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { plugins: [{ package: 'test' }, { package: 'test' }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any: unknown property', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_unknown').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any.id backward compatibility', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_id_compat').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any.enabled removed', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_enabled').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any.package: required', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_package_required').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any.package: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_package_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any.package: should not include a version', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_package_version').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any.package: should not include a URI scheme', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_package_scheme').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any.pinned_version: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_pinned_version_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugins.any.inputs: object', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_inputs_object').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build: object', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_object').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.ignore: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_ignore_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.publish: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_publish_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.publish: parent directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_publish_parent').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.publish: can be outside of build directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_publish_parent_build').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.publish: cannot be outside of root repository', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_publish_parent_root').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.functions: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_functions_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.functions: parent directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_functions_parent').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.edge_functions: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_edge_functions_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.edge_functions: parent directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_edge_functions_parent').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('spa_fallback: boolean', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/spa_fallback_boolean').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.base: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_base_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.base: parent directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_base_parent').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.command: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_command_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.command: array', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_command_array').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.command is validated even when not used due to merging', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_command_merge')
    .withFlags({ defaultConfig: { build: { command: false } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.context: property', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_property')
    .withFlags({ context: 'development' })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.context: nested property', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_nested_property')
    .withFlags({ context: 'development' })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.context: object', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_object').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.context.CONTEXT: object', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_nested_object').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.context properties are validated like top-level ones', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_validation').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.context properties are validated like top-level ones even on different context', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_validation')
    .withFlags({ context: 'development' })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Warns when using UI plugins together with context-specific plugin configuration', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_plugins_warn')
    .withFlags({ defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not warn when using context-free plugin configuration together with context-specific plugin configuration', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_plugins_nowarn_global').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not warn when using no context-free plugin configuration together with context-specific plugin configuration', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_plugins_nowarn_none').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Throws when using UI plugins together with context-specific plugin configuration in a different context', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_plugins_warn')
    .withFlags({ context: 'development', defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not throw when using UI plugins together with context-specific plugin configuration in a different context but with inputs', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_context_plugins_warn_inputs')
    .withFlags({ context: 'development', defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions: object', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function_config_invalid_root').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions block: object', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function_config_invalid_function_block').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions.external_node_modules: array of strings', async () => {
  const output = await new Fixture(
    import.meta.url,
    './fixtures/function_config_invalid_external_modules',
  ).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions.included_files: is array of strings', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function_config_invalid_included_files').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions.ignored_node_modules: array of strings', async () => {
  const output = await new Fixture(
    import.meta.url,
    './fixtures/function_config_invalid_ignored_modules',
  ).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions.node_bundler: one of supported bundlers', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function_config_invalid_node_bundler').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions.directory: defined on the main functions object', async () => {
  const output = await new Fixture(
    import.meta.url,
    './fixtures/function_config_invalid_nested_directory',
  ).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('functions.deno_import_map: string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_deno_import_map').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Validates defaultConfig', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { build: { command: false } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Validates inlineConfig', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ inlineConfig: { build: { command: false } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions: not array', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_not_array').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions: not array of objects', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_not_array_of_objects').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any: unknown properties', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_unknown_props').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any: missing properties', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_missing_props').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.path: invalid path', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_invalid_path').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.excludedPath: invalid path', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_excluded_path_invalid').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.test: pattern and path are exclusive', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_pattern_path_exclusive').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.test: excludedPattern and excludedPath are exclusive', async () => {
  const output = await new Fixture(
    import.meta.url,
    './fixtures/edge_functions_excluded_pattern_path_exclusive',
  ).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.function: not a string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_not_a_string').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.mode: allowed values', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_mode_allowed').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.mode: disallowed values', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_mode_disallowed').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.method: disallowed values', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_method_disallowed').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.name: allowed in netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_name').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.generator: not allowed in netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_reserved_generator').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.header: allowed values', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_header_allowed').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('edge_functions.any.header: disallowed values', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_header_disallowed').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
