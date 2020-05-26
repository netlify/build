const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Do not log secret values on build errors', async t => {
  await runFixture(t, 'log_secret')
})
