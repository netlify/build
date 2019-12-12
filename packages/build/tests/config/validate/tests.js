const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('plugins: not array', async t => {
  await runFixture(t, 'plugins_not_array')
})

test('plugins: not array of objects', async t => {
  await runFixture(t, 'plugins_not_objects')
})

test('plugins.any: unknown property', async t => {
  await runFixture(t, 'plugins_unknown')
})

test('plugins.any.id: string', async t => {
  await runFixture(t, 'plugins_id_string')
})

test('plugins.any.type: required', async t => {
  await runFixture(t, 'plugins_type_required')
})

test('plugins.any.type: string', async t => {
  await runFixture(t, 'plugins_type_string')
})

test('plugins.any.enabled: boolean', async t => {
  await runFixture(t, 'plugins_enabled_boolean')
})

test('plugins.any.config: object', async t => {
  await runFixture(t, 'plugins_config_object')
})

test('build: object', async t => {
  await runFixture(t, 'build_object')
})

test('build.publish: string', async t => {
  await runFixture(t, 'build_publish_string')
})

test('build.functions: string', async t => {
  await runFixture(t, 'build_functions_string')
})

test('build.command: string', async t => {
  await runFixture(t, 'build_command_string')
})

test('build.command: array of strings', async t => {
  await runFixture(t, 'build_command_array')
})

test('build.command: not with lifecycle', async t => {
  await runFixture(t, 'build_command_no_lifecycle')
})

test('build.lifecycle: object', async t => {
  await runFixture(t, 'build_lifecycle_object')
})

test('build.lifecycle: event names', async t => {
  await runFixture(t, 'build_lifecycle_events')
})

test('build.lifecycle: string', async t => {
  await runFixture(t, 'build_lifecycle_events_string')
})

test('build.lifecycle: array', async t => {
  await runFixture(t, 'build_lifecycle_events_array')
})
