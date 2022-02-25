import test from 'ava'

import { runFixture } from '../helpers/main.js'

test('exception', async (t) => {
  await runFixture(t, 'exception')
})

test('exception with static properties', async (t) => {
  await runFixture(t, 'exception_props')
})

test('exception with circular references', async (t) => {
  await runFixture(t, 'exception_circular')
})

test('exception that are strings', async (t) => {
  await runFixture(t, 'exception_string')
})

test('exception that are arrays', async (t) => {
  await runFixture(t, 'exception_array')
})

test('Do not log secret values on build errors', async (t) => {
  await runFixture(t, 'log_secret')
})

test('TOML parsing errors', async (t) => {
  await runFixture(t, 'toml_parsing')
})

test('Invalid error instances', async (t) => {
  await runFixture(t, 'invalid_instance')
})

test('Top-level errors', async (t) => {
  await runFixture(t, 'top')
})

test('Top function errors local', async (t) => {
  await runFixture(t, 'function')
})

test('Node module all fields', async (t) => {
  await runFixture(t, 'full')
})

test('Node module partial fields', async (t) => {
  await runFixture(t, 'partial')
})

test('No repository root', async (t) => {
  await runFixture(t, 'no_root', { copyRoot: { git: false } })
})

test('Process warnings', async (t) => {
  await runFixture(t, 'warning')
})

test('Uncaught exception', async (t) => {
  await runFixture(t, 'uncaught')
})

test('Unhandled promises', async (t) => {
  await runFixture(t, 'unhandled_promise')
})

test('Exits in plugins', async (t) => {
  await runFixture(t, 'plugin_exit')
})

test('Plugin errors can have a toJSON() method', async (t) => {
  await runFixture(t, 'plugin_error_to_json')
})

// Process exit is different on Windows
// @todo: re-enable. This test is currently randomly failing.
// @todo: uncomment after upgrading to Ava v4.
// See https://github.com/netlify/build/issues/3615
// if (platform !== 'win32') {
//   test.skip('Early exit', async (t) => {
//     await runFixture(t, 'early_exit')
//   })
// }

test('Redact API token on errors', async (t) => {
  await runFixture(t, 'api_token_redact', {
    flags: { token: '0123456789abcdef', deployId: 'test', mode: 'buildbot', testOpts: { host: '...' } },
  })
})
