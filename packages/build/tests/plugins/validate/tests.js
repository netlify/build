const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Validate plugin.name is required', async t => {
  await runFixture(t, 'name_required')
})

test('Validate plugin.name is a string', async t => {
  await runFixture(t, 'name_string')
})
