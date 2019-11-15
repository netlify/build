const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Node modules', async t => {
  await runFixture(t, 'simple', { env: { CACHE_PATH: 'node_modules/test/test.js' } })
})
