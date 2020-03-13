const test = require('ava')
const hasAnsi = require('has-ansi')

const { runFixtureConfig } = require('../helpers/main')

test('plugins: not array', async t => {
  await runFixtureConfig(t, 'plugins_not_array')
})

test('plugins: not array of objects', async t => {
  await runFixtureConfig(t, 'plugins_not_objects')
})

test('plugins.any: unknown property', async t => {
  await runFixtureConfig(t, 'plugins_unknown')
})

test('plugins.any.id: string', async t => {
  await runFixtureConfig(t, 'plugins_id_string')
})

test('plugins.any.type renamed', async t => {
  await runFixtureConfig(t, 'plugins_type_renamed')
})

test('plugins.any.package: required', async t => {
  await runFixtureConfig(t, 'plugins_package_required')
})

test('plugins.any.package: string', async t => {
  await runFixtureConfig(t, 'plugins_package_string')
})

test('plugins.any.enabled: boolean', async t => {
  await runFixtureConfig(t, 'plugins_enabled_boolean')
})

test('plugins.any.config: renamed', async t => {
  await runFixtureConfig(t, 'plugins_config_renamed')
})

test('plugins.any.inputs: object', async t => {
  await runFixtureConfig(t, 'plugins_inputs_object')
})

test('build: object', async t => {
  await runFixtureConfig(t, 'build_object')
})

test('build.publish: string', async t => {
  await runFixtureConfig(t, 'build_publish_string')
})

test('build.publish: parent directory', async t => {
  await runFixtureConfig(t, 'build_publish_parent')
})

test('build.functions: string', async t => {
  await runFixtureConfig(t, 'build_functions_string')
})

test('build.functions: parent directory', async t => {
  await runFixtureConfig(t, 'build_functions_parent')
})

test('build.base: string', async t => {
  await runFixtureConfig(t, 'build_base_string')
})

test('build.base: parent directory', async t => {
  await runFixtureConfig(t, 'build_base_parent')
})

test('build.command: string', async t => {
  await runFixtureConfig(t, 'build_command_string')
})

test('build.command: not with lifecycle', async t => {
  await runFixtureConfig(t, 'build_command_no_lifecycle')
})

test('build.command: with environment variable lifecycle', async t => {
  await runFixtureConfig(t, 'build_command_lifecycle_envvar', {
    env: { NETLIFY_CONFIG_BUILD_LIFECYCLE_ONBUILD: 'echo onBuild' },
  })
})

test('build.lifecycle: object', async t => {
  await runFixtureConfig(t, 'build_lifecycle_object')
})

test('build.lifecycle: event names', async t => {
  await runFixtureConfig(t, 'build_lifecycle_events')
})

test('build.lifecycle: string', async t => {
  await runFixtureConfig(t, 'build_lifecycle_events_string')
})

test('build.lifecycle: array', async t => {
  await runFixtureConfig(t, 'build_lifecycle_events_array')
})

test('build.context: property', async t => {
  await runFixtureConfig(t, 'build_context_property')
})

test('build.context: nested property', async t => {
  await runFixtureConfig(t, 'build_context_nested_property')
})

test('build.context: object', async t => {
  await runFixtureConfig(t, 'build_context_object')
})

test('build.context.CONTEXT: object', async t => {
  await runFixtureConfig(t, 'build_context_nested_object')
})

test('Colors', async t => {
  const { stderr } = await runFixtureConfig(t, 'build_object', { snapshot: false, normalize: false })
  t.true(hasAnsi(stderr))
})
