const test = require('ava')

const { runFixture } = require('./helpers/main')

test('Can use local plugins', async t => {
  await runFixture(t, 'local_plugin')
})

test('Can use Node module plugins', async t => {
  await runFixture(t, 'module_plugin')
})

test('Reports missing plugins', async t => {
  await runFixture(t, 'missing_plugin')
})

test('Plugin.id is optional', async t => {
  await runFixture(t, 'optional_plugin_id')
})

test('Validate plugin.name is required', async t => {
  await runFixture(t, 'plugin_validate_name_required')
})

test('Validate plugin.name is a string', async t => {
  await runFixture(t, 'plugin_validate_name_string')
})

test('Remove duplicate plugin options', async t => {
  await runFixture(t, 'duplicate_plugin')
})

test('Does not remove duplicate plugin options with different ids', async t => {
  await runFixture(t, 'duplicate_plugin_different_id')
})

test('Remove duplicate plugin options with different configs but same id', async t => {
  await runFixture(t, 'duplicate_plugin_different_config')
})

test('Can override plugins', async t => {
  await runFixture(t, 'override')
})

test('Plugins can execute local binaries', async t => {
  await runFixture(t, 'local_bin_plugin')
})

test('Plugin output can interleave stdout and stderr', async t => {
  await runFixture(t, 'plugin_streams')
})
