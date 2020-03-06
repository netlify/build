const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Context with CLI flag', async t => {
  await runFixture(t, 'flag')
})

test('Context deep merge', async t => {
  await runFixture(t, 'deep_merge')
})

test('Context array merge', async t => {
  await runFixture(t, 'array_merge')
})
