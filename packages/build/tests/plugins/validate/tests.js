const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Validate plugin is an object', async t => {
  await runFixture(t, 'object')
})

test('Validate plugin.name is required', async t => {
  await runFixture(t, 'name_required')
})

test('Validate plugin lifecycle names', async t => {
  await runFixture(t, 'lifecycle')
})

test('Validate plugin property names', async t => {
  await runFixture(t, 'property')
})

test('Validate plugin.name is a string', async t => {
  await runFixture(t, 'name_string')
})

test('Validate plugin.scopes is valid', async t => {
  await runFixture(t, 'scopes')
})
