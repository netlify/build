import test from 'ava'
import chalk from 'chalk'
import hasAnsi from 'has-ansi'
// import isCI from 'is-ci'

import { runFixture } from '../helpers/main.js'

// Common options for color-related tests
const opts = { snapshot: false, normalize: false, useBinary: true }

test('Colors in parent process', async (t) => {
  const { returnValue } = await runFixture(t, 'parent', { ...opts, flags: { dry: true }, env: { FORCE_COLOR: '1' } })
  t.true(hasAnsi(returnValue))
})

test('Colors in child process', async (t) => {
  const { returnValue } = await runFixture(t, 'child', { ...opts, env: { FORCE_COLOR: '1' } })
  t.true(returnValue.includes(chalk.red('onPreBuild')))
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
  const { returnValue } = await runFixture(t, 'parent', { ...opts, env: { FORCE_COLOR: '0' }, flags: { dry: true } })
  t.false(hasAnsi(returnValue))
})

// In GitHub actions, `update-notifier` is never enabled
// @todo: uncomment after upgrading to Ava v4.
// See https://github.com/netlify/build/issues/3615
// if (!isCI) {
//   test('Print a warning when using an old version through Netlify CLI', async (t) => {
//     // We need to unset some environment variables which would otherwise disable `update-notifier`
//     await runFixture(t, 'error', {
//       flags: { mode: 'cli', testOpts: { oldCliLogs: true } },
//       env: { NODE_ENV: '' },
//       useBinary: true,
//     })
//   })
// }

test('Logs whether the build commands came from the UI', async (t) => {
  const defaultConfig = { build: { command: 'node --invalid' } }
  await runFixture(t, 'empty', { flags: { defaultConfig } })
})

test('The verbose flag enables verbosity', async (t) => {
  await runFixture(t, 'verbose', { flags: { verbose: true } })
})

test('Verbosity works with plugin errors', async (t) => {
  await runFixture(t, 'verbose_error', { flags: { verbose: true } })
})
