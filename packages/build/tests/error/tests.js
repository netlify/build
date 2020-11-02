'use strict'

const { cwd, version, platform } = require('process')

const test = require('ava')
const hasAnsi = require('has-ansi')

const { runFixture } = require('../helpers/main')
const { startServer } = require('../helpers/server')

const CANCEL_PATH = '/api/v1/deploys/test/cancel'

test('build.failBuild()', async (t) => {
  await runFixture(t, 'fail_build')
})

test('build.failBuild() error option', async (t) => {
  await runFixture(t, 'fail_build_error_option')
})

test('build.failBuild() inside a callback', async (t) => {
  await runFixture(t, 'fail_build_callback')
})

test('build.failBuild() is not available within post-deploy events', async (t) => {
  await runFixture(t, 'fail_build_post_deploy')
})

test('build.failPlugin()', async (t) => {
  await runFixture(t, 'fail_plugin')
})

test('build.failPlugin() inside a callback', async (t) => {
  await runFixture(t, 'fail_plugin_callback')
})

test('build.failPlugin() error option', async (t) => {
  await runFixture(t, 'fail_plugin_error_option')
})

test('build.cancelBuild()', async (t) => {
  await runFixture(t, 'cancel')
})

test('build.cancelBuild() inside a callback', async (t) => {
  await runFixture(t, 'cancel_callback')
})

test('build.cancelBuild() error option', async (t) => {
  await runFixture(t, 'cancel_error_option')
})

test('build.cancelBuild() API call', async (t) => {
  const { scheme, host, requests, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', { flags: { token: 'test', deployId: 'test', testOpts: { scheme, host } } })
  await stopServer()
  t.snapshot(requests)
})

test('build.cancelBuild() API call no DEPLOY_ID', async (t) => {
  const { scheme, host, requests, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', { flags: { token: 'test', testOpts: { scheme, host } } })
  await stopServer()
  t.is(requests.length, 0)
})

test('build.cancelBuild() API call no token', async (t) => {
  const { scheme, host, requests, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', { flags: { deployId: 'test', testOpts: { scheme, host } } })
  await stopServer()
  t.is(requests.length, 0)
})

// Node 10 `util.inspect()` output is different from Node 8, leading to
// inconsistent test snapshots
// TODO: remove once dropping Node 8
if (!version.startsWith('v8.')) {
  test('build.cancelBuild() API call failure', async (t) => {
    await runFixture(t, 'cancel', { flags: { token: 'test', deployId: 'test', testOpts: { host: '...' } } })
  })
}

test('build.cancelBuild() is not available within post-deploy events', async (t) => {
  await runFixture(t, 'cancel_post_deploy')
})

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

test('Clean stack traces of build.command', async (t) => {
  const { returnValue } = await runFixture(t, 'build_command', {
    flags: { debug: false },
    snapshot: false,
    normalize: false,
  })
  const count = getStackLinesCount(returnValue)
  t.is(count, 0)
})

test('Clean stack traces of plugin event handlers', async (t) => {
  const { returnValue } = await runFixture(t, 'plugin', { flags: { debug: false }, snapshot: false, normalize: false })
  const count = getStackLinesCount(returnValue)
  t.is(count, 1)
})

test('Do not clean stack traces in debug mode', async (t) => {
  const { returnValue } = await runFixture(t, 'plugin', { flags: { debug: true }, snapshot: false, normalize: false })
  const count = getStackLinesCount(returnValue)
  t.not(count, 1)
})

test('Does not clean stack traces of exceptions', async (t) => {
  const { returnValue } = await runFixture(t, 'stack_exception', {
    flags: { debug: false },
    snapshot: false,
    normalize: false,
  })
  const count = getStackLinesCount(returnValue)
  t.not(count, 1)
})

test('Clean stack traces of config validation', async (t) => {
  const { returnValue } = await runFixture(t, 'config_validation', {
    false: { debug: false },
    snapshot: false,
    normalize: false,
  })
  const count = getStackLinesCount(returnValue)
  t.is(count, 0)
})

const getStackLinesCount = function (returnValue) {
  return returnValue.split('\n').filter(isStackLine).length
}

const isStackLine = function (line) {
  return line.trim().startsWith('at ')
}

test('Clean stack traces from cwd', async (t) => {
  const { returnValue } = await runFixture(t, 'plugin', { flags: { debug: false }, snapshot: false, normalize: false })
  t.false(returnValue.includes(`onPreBuild (${cwd()}`))
})

test('Clean stack traces but keep error message', async (t) => {
  const { returnValue } = await runFixture(t, 'plugin', { flags: { debug: false }, snapshot: false, normalize: false })
  t.true(returnValue.includes('Error: test'))
})

test('Do not log secret values on build errors', async (t) => {
  await runFixture(t, 'log_secret')
})

const BUGSNAG_TEST_KEY = '00000000000000000000000000000000'
const flags = { testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY }

test('Report build.command failure', async (t) => {
  await runFixture(t, 'command', { flags })
})

test('Report configuration user error', async (t) => {
  await runFixture(t, 'config', { flags })
})

test('Report plugin input error', async (t) => {
  await runFixture(t, 'plugin_input', { flags })
})

test('Report plugin validation error', async (t) => {
  await runFixture(t, 'plugin_validation', { flags })
})

test('Report plugin internal error', async (t) => {
  await runFixture(t, 'plugin_internal', { flags })
})

test('Report utils.build.failBuild()', async (t) => {
  await runFixture(t, 'monitor_fail_build', { flags })
})

test('Report utils.build.failPlugin()', async (t) => {
  await runFixture(t, 'monitor_fail_plugin', { flags })
})

test('Report utils.build.cancelBuild()', async (t) => {
  await runFixture(t, 'cancel_build', { flags })
})

test('Report IPC error', async (t) => {
  await runFixture(t, 'ipc', { flags })
})

test('Report API error', async (t) => {
  await runFixture(t, 'cancel_build', { flags: { ...flags, token: 'test', deployId: 'test' } })
})

// Node v8 uses a different error message format
// TODO: remove once dropping Node 8
if (!version.startsWith('v8.')) {
  test('Report dependencies error', async (t) => {
    await runFixture(t, 'dependencies', { flags })
  })
}

test('Report buildbot mode as releaseStage', async (t) => {
  await runFixture(t, 'command', { flags: { ...flags, mode: 'buildbot' }, useBinary: true })
})

test('Report CLI mode as releaseStage', async (t) => {
  await runFixture(t, 'command', { flags: { ...flags, mode: 'cli' }, useBinary: true })
})

test('Report programmatic mode as releaseStage', async (t) => {
  await runFixture(t, 'command', { flags: { ...flags, mode: 'require' }, useBinary: true })
})

test('Remove colors in error.message', async (t) => {
  const { returnValue } = await runFixture(t, 'colors', { flags, snapshot: false })
  const lines = returnValue.split('\n').filter((line) => line.includes('ColorTest'))
  t.true(lines.every((line) => !hasAnsi(line)))
})

test('Report BUILD_ID', async (t) => {
  await runFixture(t, 'command', { flags, env: { BUILD_ID: 'test' }, useBinary: true })
})

test('Report plugin homepage', async (t) => {
  await runFixture(t, 'plugin_homepage', { flags })
})

test('Report plugin homepage without a repository', async (t) => {
  await runFixture(t, 'plugin_homepage_no_repo', { flags })
})

test('Report plugin origin', async (t) => {
  const defaultConfig = JSON.stringify({ plugins: [{ package: './plugin.js' }] })
  await runFixture(t, 'plugin_origin', { flags: { ...flags, defaultConfig } })
})

test('Report build logs URLs', async (t) => {
  await runFixture(t, 'command', {
    flags,
    env: { DEPLOY_ID: 'testDeployId', SITE_NAME: 'testSiteName' },
    useBinary: true,
  })
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

// Process exit is different on Windows
if (platform !== 'win32') {
  test('Early exit', async (t) => {
    await runFixture(t, 'early_exit')
  })
}

test('Print stack trace of plugin errors', async (t) => {
  await runFixture(t, 'plugin_stack')
})

test('Print stack trace of plugin errors during load', async (t) => {
  await runFixture(t, 'plugin_load')
})

test('Print stack trace of build.command errors', async (t) => {
  await runFixture(t, 'command_stack')
})

test('Print stack trace of build.command errors with stack traces', async (t) => {
  await runFixture(t, 'command_full_stack')
})

test('Print stack trace of Build command UI settings', async (t) => {
  const defaultConfig = JSON.stringify({ build: { command: 'node --invalid' } })
  await runFixture(t, 'none', { flags: { defaultConfig } })
})

test('Print stack trace of validation errors', async (t) => {
  await runFixture(t, '', { flags: { config: '/invalid' } })
})

// Node 10 `util.inspect()` output is different from Node 8, leading to
// inconsistent test snapshots
// TODO: remove once dropping Node 8
if (!version.startsWith('v8.')) {
  test('Redact API token on errors', async (t) => {
    await runFixture(t, 'api_token_redact', {
      flags: { token: '0123456789abcdef', deployId: 'test', mode: 'buildbot', testOpts: { host: '...' } },
    })
  })
}
