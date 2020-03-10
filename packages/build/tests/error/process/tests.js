const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('NETLIFY_BUILD_DEBUG_PROCESS_ERRORS environment variable', async t => {
  await runFixture(t, 'process', { env: { NETLIFY_BUILD_DEBUG_PROCESS_ERRORS: '1' } })
})
