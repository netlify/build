const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('--dry with one event', async t => {
  await runFixture(t, 'single', { flags: '--dry' })
})

test('--dry with several events', async t => {
  await runFixture(t, 'several', { flags: '--dry' })
})

test('--dry-run', async t => {
  await runFixture(t, 'single', { flags: '--dry-run' })
})
