const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('utils load', async t => {
  await runFixture(t, 'load')
})
