const test = require('ava')
const { red } = require('chalk')
const hasAnsi = require('has-ansi')
const isCI = require('is-ci')

const { runFixture } = require('../helpers/main')

test('Colors in parent process', async t => {
  const { returnValue } = await runFixture(t, 'parent', {
    snapshot: false,
    normalize: false,
    flags: { dry: true },
    env: { FORCE_COLOR: '1' },
    useBinary: true,
  })
  t.true(hasAnsi(returnValue))
})

test('Colors in child process', async t => {
  const { returnValue } = await runFixture(t, 'child', {
    snapshot: false,
    normalize: false,
    env: { FORCE_COLOR: '1' },
    useBinary: true,
  })
  t.true(returnValue.includes(red('onPreBuild')))
})

test('Netlify CI', async t => {
  const { returnValue } = await runFixture(t, 'parent', {
    snapshot: false,
    normalize: false,
    flags: { dry: true },
    env: { NETLIFY: 'true' },
    useBinary: true,
  })
  t.true(hasAnsi(returnValue))
})

test('No TTY', async t => {
  const { returnValue } = await runFixture(t, 'parent', {
    snapshot: false,
    normalize: false,
    flags: { dry: true },
    useBinary: true,
  })
  t.false(hasAnsi(returnValue))
})

// In GitHub actions, `update-notifier` is never enabled
if (!isCI) {
  test('Print a warning when using an old version through Netlify CLI', async t => {
    // We need to unset some environment variables which would otherwise disable `update-notifier`
    await runFixture(t, 'error', {
      flags: { mode: 'cli', testOpts: { oldCliLogs: true } },
      env: { NODE_ENV: '' },
      useBinary: true,
    })
  })
}
