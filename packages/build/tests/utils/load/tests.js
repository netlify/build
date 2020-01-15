const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('utils-load none', async t => {
  await runFixture(t, 'none')
})

test('utils-load sync function', async t => {
  await runFixture(t, 'function_sync')
})

test('utils-load async function', async t => {
  await runFixture(t, 'function_async')
})

test('utils-load error', async t => {
  await runFixture(t, 'function_async', { env: { CACHED_COMMIT_REF: 'aaaaaaaa' } })
})
