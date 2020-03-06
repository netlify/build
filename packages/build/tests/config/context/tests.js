const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Context syntax error', async t => {
  await runFixture(t, 'syntax_error')
})

test('Context with CLI flag', async t => {
  await runFixture(t, 'flag')
})

test('Context deep merge', async t => {
  await runFixture(t, 'deep_merge')
})
