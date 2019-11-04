const test = require('ava')

const { runFixture } = require('./helpers/main')

test('plugin.schema validates properties', async t => {
  await runFixture(t, 'plugin_schema_prop')
})

test('plugin.schema is validated as an object', async t => {
  await runFixture(t, 'plugin_schema_object')
})

test('plugin.schema is validated as an object of objects', async t => {
  await runFixture(t, 'plugin_schema_object_props')
})

test('plugin.schema is validated as a JSON schema 7', async t => {
  await runFixture(t, 'plugin_schema_invalid')
})

test('plugin.schema works with undefined pluginConfig', async t => {
  await runFixture(t, 'plugin_schema_undefined')
})

test('pluginConfig must be an object', async t => {
  await runFixture(t, 'plugin_schema_config_object')
})

test('plugin.schema validates unknown properties', async t => {
  await runFixture(t, 'plugin_schema_unknown')
})
