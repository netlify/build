'use strict'

const test = require('ava')
const { red } = require('chalk')
const hasAnsi = require('has-ansi')
const isCI = require('is-ci')

const { runFixture } = require('../helpers/main')

// Common options for color-related tests
const opts = { snapshot: false, normalize: false, useBinary: true }

test('Colors in parent process', async (t) => {
  const { returnValue } = await runFixture(t, 'parent', { ...opts, flags: { dry: true }, env: { FORCE_COLOR: '1' } })
  t.true(hasAnsi(returnValue))
})

test('Colors in child process', async (t) => {
  const { returnValue } = await runFixture(t, 'child', { ...opts, env: { FORCE_COLOR: '1' } })
  t.true(returnValue.includes(red('onPreBuild')))
})

test('Netlify CI', async (t) => {
  const { returnValue } = await runFixture(t, 'parent', {
    ...opts,
    flags: { dry: true, mode: 'buildbot' },
    env: { FORCE_COLOR: '1' },
  })
  t.true(hasAnsi(returnValue))
})

test('No TTY', async (t) => {
  const { returnValue } = await runFixture(t, 'parent', { ...opts, flags: { dry: true } })
  t.false(hasAnsi(returnValue))
})

// In GitHub actions, `update-notifier` is never enabled
if (!isCI) {
  test.skip('Print a warning when using an old version through Netlify CLI', async (t) => {
    // We need to unset some environment variables which would otherwise disable `update-notifier`
    await runFixture(t, 'error', {
      flags: { mode: 'cli', testOpts: { oldCliLogs: true } },
      env: { NODE_ENV: '' },
      useBinary: true,
    })
  })
}

test('Logs whether the build commands came from the UI', async (t) => {
  const defaultConfig = JSON.stringify({ build: { command: 'node --invalid' } })
  await runFixture(t, 'empty', { flags: { defaultConfig } })
})
