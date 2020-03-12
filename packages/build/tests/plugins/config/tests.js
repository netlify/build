const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('plugin inputs simple', async t => {
  await runFixture(t, 'simple')
})

test('pluginConfig backward compatibility', async t => {
  await runFixture(t, 'backward_compat')
})

test('plugin.config validates properties', async t => {
  await runFixture(t, 'prop')
})

test('plugin.config is validated as an object', async t => {
  await runFixture(t, 'basic')
})

test('plugin.config is validated as an object JSON schema', async t => {
  await runFixture(t, 'object_props')
})

test('plugin.config is validated as a JSON schema 7', async t => {
  await runFixture(t, 'invalid_schema')
})

test('plugin.config works with undefined inputs', async t => {
  await runFixture(t, 'undefined')
})

test('plugin.config validates unknown properties', async t => {
  await runFixture(t, 'unknown')
})

test('plugin.config validates required properties', async t => {
  await runFixture(t, 'required')
})

test('plugin.config assign default values', async t => {
  await runFixture(t, 'default')
})

test('plugin.config coerce types', async t => {
  await runFixture(t, 'coerce')
})
