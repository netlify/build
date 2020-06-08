const test = require('ava')

const { runFixture } = require('../helpers/main')

test('plugins: not array', async t => {
  await runFixture(t, 'plugins_not_array')
})

test('plugins: not array of objects', async t => {
  await runFixture(t, 'plugins_not_objects')
})

test('plugins: do not allow duplicates', async t => {
  await runFixture(t, 'plugins_duplicate')
})

test('plugins.any: unknown property', async t => {
  await runFixture(t, 'plugins_unknown')
})

test('plugins.any.id backward compatibility', async t => {
  await runFixture(t, 'plugins_id_compat')
})

test('plugins.any.enabled removed', async t => {
  await runFixture(t, 'plugins_enabled')
})

test('plugins.any.package: required', async t => {
  await runFixture(t, 'plugins_package_required')
})

test('plugins.any.package: string', async t => {
  await runFixture(t, 'plugins_package_string')
})

test('plugins.any.package: should not include a version', async t => {
  await runFixture(t, 'plugins_package_version')
})

test('plugins.any.package: should not include a URI scheme', async t => {
  await runFixture(t, 'plugins_package_scheme')
})

test('plugins.any.inputs: object', async t => {
  await runFixture(t, 'plugins_inputs_object')
})

test('build: object', async t => {
  await runFixture(t, 'build_object')
})

test('build.publish: string', async t => {
  await runFixture(t, 'build_publish_string')
})

test('build.publish: parent directory', async t => {
  await runFixture(t, 'build_publish_parent')
})

test('build.functions: string', async t => {
  await runFixture(t, 'build_functions_string')
})

test('build.functions: parent directory', async t => {
  await runFixture(t, 'build_functions_parent')
})

test('build.base: string', async t => {
  await runFixture(t, 'build_base_string')
})

test('build.base: parent directory', async t => {
  await runFixture(t, 'build_base_parent')
})

test('build.command: string', async t => {
  await runFixture(t, 'build_command_string')
})

test('build.command: array', async t => {
  await runFixture(t, 'build_command_array')
})

test('build.context: property', async t => {
  await runFixture(t, 'build_context_property', { flags: { context: 'development' } })
})

test('build.context: nested property', async t => {
  await runFixture(t, 'build_context_nested_property', { flags: { context: 'development' } })
})

test('build.context: object', async t => {
  await runFixture(t, 'build_context_object')
})

test('build.context.CONTEXT: object', async t => {
  await runFixture(t, 'build_context_nested_object')
})
