const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('--dry with 0 hooks', async t => {
  await runFixture(t, 'none', { flags: '--dry' })
})

test('--dry with 1 hook', async t => {
  await runFixture(t, 'single', { flags: '--dry' })
})

test('--dry with several hooks', async t => {
  await runFixture(t, 'several', { flags: '--dry' })
})
