const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('exec-utils defined', async t => {
  await runFixture(t, 'defined')
})

test('exec-utils normal', async t => {
  await runFixture(t, 'normal')
})
