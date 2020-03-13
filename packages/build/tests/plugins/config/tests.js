const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('plugin inputs simple', async t => {
  await runFixture(t, 'simple')
})

test('pluginConfig backward compatibility', async t => {
  await runFixture(t, 'backward_compat_pluginconfig')
})

test('plugin.config backward compatibility', async t => {
  await runFixture(t, 'backward_compat_config')
})

test('plugin.inputs validates properties', async t => {
  await runFixture(t, 'prop')
})

test('plugin.inputs is validated as an object', async t => {
  await runFixture(t, 'basic')
})

test('plugin.inputs is validated as an object JSON schema', async t => {
  await runFixture(t, 'object_props')
})

test('plugin.inputs is validated as a JSON schema 7', async t => {
  await runFixture(t, 'invalid_schema')
})

test('plugin.inputs works with undefined inputs', async t => {
  await runFixture(t, 'undefined')
})

test('plugin.inputs validates unknown properties', async t => {
  await runFixture(t, 'unknown')
})

test('plugin.inputs validates required properties', async t => {
  await runFixture(t, 'required')
})

test('plugin.inputs assign default values', async t => {
  await runFixture(t, 'default')
})

test('plugin.inputs coerce types', async t => {
  await runFixture(t, 'coerce')
})
