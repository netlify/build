// const { platform } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Cache local', async t => {
  await runFixture(t, 'local', { env: { TEST_CACHE_PATH: 'bower_components' } })
})

test('Cache CI', async t => {
  await runFixture(t, 'ci', { env: { TEST_CACHE_PATH: 'bower_components', DEPLOY_PRIME_URL: 'test' } })
})
