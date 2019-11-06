const test = require('ava')

const { runFixture } = require('./helpers/main')

test('Allow prebuild instead of preBuild', async t => {
  await runFixture(t, 'config_normalize_case')
})
