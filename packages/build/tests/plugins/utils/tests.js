const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('utils none', async t => {
  await runFixture(t, 'none')
})

test('utils sync function', async t => {
  await runFixture(t, 'function_sync')
})

test('utils async function', async t => {
  await runFixture(t, 'function_async')
})

test('utils error', async t => {
  await runFixture(t, 'error')
})
