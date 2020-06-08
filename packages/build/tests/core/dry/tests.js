const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('--dry with one event', async t => {
  await runFixture(t, 'single', { flags: { dry: true } })
})

test('--dry with several events', async t => {
  await runFixture(t, 'several', { flags: { dry: true } })
})

test('--dry-run', async t => {
  await runFixture(t, 'single', { flags: { dryRun: true }, useBinary: true })
})

test('--dry with build.command but no netlify.toml', async t => {
  await runFixture(t, 'none', { flags: { dry: true, defaultConfig: '{"build":{"command":"echo"}}' } })
})
