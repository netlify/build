const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Outputs basic', async t => {
  await runFixture(t, 'basic')
})
