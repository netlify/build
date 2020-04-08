const test = require('ava')
const hasAnsi = require('has-ansi')

const { runFixture } = require('../helpers/main')

test('plugins: not array', async t => {
  await runFixture(t, 'plugins_not_array')
})

test('plugins: not array of objects', async t => {
  await runFixture(t, 'plugins_not_objects')
})

test('plugins.any: unknown property', async t => {
  await runFixture(t, 'plugins_unknown')
})

test('plugins.any.id backward compatibility', async t => {
  await runFixture(t, 'plugins_id_compat')
})

test('plugins.any.type renamed', async t => {
  await runFixture(t, 'plugins_type_renamed')
})

test('plugins.any.package: required', async t => {
  await runFixture(t, 'plugins_package_required')
})

test('plugins.any.package: string', async t => {
  await runFixture(t, 'plugins_package_string')
})

test('plugins.any.config: renamed', async t => {
  await runFixture(t, 'plugins_config_renamed')
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

test('build.lifecycle: deprecated', async t => {
  await runFixture(t, 'build_lifecycle')
})

test('build.context: property', async t => {
  await runFixture(t, 'build_context_property')
})

test('build.context: nested property', async t => {
  await runFixture(t, 'build_context_nested_property')
})

test('build.context: object', async t => {
  await runFixture(t, 'build_context_object')
})

test('build.context.CONTEXT: object', async t => {
  await runFixture(t, 'build_context_nested_object')
})

test.skip('Colors', async t => {
  const { stderr } = await runFixture(t, 'build_object', { snapshot: false, normalize: false })
  t.true(hasAnsi(stderr))
})
