const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Node modules', async t => {
  await runFixture(t, 'node')
})
