const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('cache-utils defined', async t => {
  await runFixture(t, 'defined')
})
