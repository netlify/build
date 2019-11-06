const test = require('ava')

const { runFixture } = require('./helpers/main')

test('plugin.config validates properties', async t => {
  await runFixture(t, 'plugin_config_prop')
})

test('plugin.config is validated as an object', async t => {
  await runFixture(t, 'plugin_config_basic')
})

test('plugin.config is validated as an object JSON schema', async t => {
  await runFixture(t, 'plugin_config_object_props')
})

test('plugin.config is validated as a JSON schema 7', async t => {
  await runFixture(t, 'plugin_config_invalid')
})

test('plugin.config works with undefined pluginConfig', async t => {
  await runFixture(t, 'plugin_config_undefined')
})

test('pluginConfig must be an object', async t => {
  await runFixture(t, 'plugin_config_object')
})

test('plugin.config validates unknown properties', async t => {
  await runFixture(t, 'plugin_config_unknown')
})

test('plugin.config validates required properties', async t => {
  await runFixture(t, 'plugin_config_required')
})

test('plugin.config assign default values', async t => {
  await runFixture(t, 'plugin_config_default')
})

test('plugin.config coerce types', async t => {
  await runFixture(t, 'plugin_config_coerce')
})
