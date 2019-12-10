const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('utils none', async t => {
  await runFixture(t, 'none')
})

test('utils load', async t => {
  await runFixture(t, 'load')
})
