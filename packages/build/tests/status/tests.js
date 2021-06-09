'use strict'

const { version: nodeVersion } = require('process')

const test = require('ava')

const { runFixture } = require('../helpers/main')
const { startServer } = require('../helpers/server')

const STATUS_PATH = '/api/v1/deploys/test/plugin_runs'

// Normalize API request body so it can be snapshot in a stable way
const normalizeRequest = function ({ body: { version, text, ...body }, ...request }) {
  const versionA = version === undefined ? version : version.replace(VERSION_REGEXP, '1.0.0')
  const textA = normalizeText(text)
  return { ...request, body: { ...body, version: versionA, text: textA } }
}

const normalizeText = function (text) {
  if (typeof text !== 'string') {
    return text
  }

  return text.replace(STACK_TRACE_REGEXP, '').replace(WHITESPACE_REGEXP, ' ').trim()
}

const VERSION_REGEXP = /\d+\.\d+\.\d+/g
const STACK_TRACE_REGEXP = /^\s+at .*/gm
const WHITESPACE_REGEXP = /\s+/g

const comparePackage = function ({ body: { package: packageA } }, { body: { package: packageB } }) {
  return packageA < packageB ? -1 : 1
}

const runWithApiMock = async function (t, fixture, { flags = { token: 'test' }, status } = {}) {
  const { scheme, host, requests, stopServer } = await startServer({ path: STATUS_PATH, status })
  await runFixture(t, fixture, {
    flags: { deployId: 'test', ...flags, sendStatus: true, testOpts: { scheme, host } },
  })
  await stopServer()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
}

test('utils.status.show() can override a success status', async (t) => {
  await runWithApiMock(t, 'success_status_override')
})

test('utils.status.show() cannot override an error status with a success status', async (t) => {
  await runWithApiMock(t, 'error_status_override')
})

test('utils.status.show() plugin error cannot override a build error', async (t) => {
  await runWithApiMock(t, 'error_status_error_override')
})

test('utils.status.show() implicit status is not used when an explicit call was made', async (t) => {
  await runWithApiMock(t, 'no_implicit')
})

test('utils.status.show() implicit status is not used when there are no events', async (t) => {
  await runWithApiMock(t, 'no_implicit_none')
})

test('utils.status.show() implicit status is not used when plugin did not complete', async (t) => {
  await runWithApiMock(t, 'no_implicit_incomplete')
})

test('utils.status.show() implicit status is not used when no call was made, with only onError', async (t) => {
  await runWithApiMock(t, 'no_implicit_onerror')
})

test('utils.status.show() implicit status is used when no call was made', async (t) => {
  await runWithApiMock(t, 'implicit_one')
})

test('utils.status.show() implicit status is used when no events have made a call', async (t) => {
  await runWithApiMock(t, 'implicit_several')
})

test('utils.status.show() implicit status is used when no call was made, with only onEnd', async (t) => {
  await runWithApiMock(t, 'implicit_onend')
})

test('utils.status.show() are printed locally', async (t) => {
  await runFixture(t, 'print')
})

// Node.js v8 test executions trigger a plugin warning when run with mode buildbot related with the Node.js version used
// to execute the plugins. Not too critical given production executions always run with Node v12.x
// @TODO remove once we drop Node v8 support or remove the plugin Node.js version warning - https://github.com/netlify/build/blob/6e718e3f040397ba30da5c32b275b914381685e0/packages/build/src/log/messages/plugins.js#L41-L48
if (!nodeVersion.startsWith('v8.')) {
  test('utils.status.show() are not printed in production', async (t) => {
    await runFixture(t, 'print', { flags: { mode: 'buildbot' } })
  })
}

test('utils.status.show() statuses are sent to the API', async (t) => {
  await runWithApiMock(t, 'print')
})

test('utils.status.show() statuses are not sent to the API without a token', async (t) => {
  await runWithApiMock(t, 'print', { flags: { token: '' } })
})

test('utils.status.show() statuses are not sent to the API without a DEPLOY_ID', async (t) => {
  await runWithApiMock(t, 'print', { flags: { deployId: '' } })
})

// This package currently supports Node 8 but not zip-it-and-ship-it
// @todo remove once Node 8 support is removed
if (!nodeVersion.startsWith('v8.')) {
  test('utils.status.show() statuses are sent to the API for core commands', async (t) => {
    await runWithApiMock(t, 'core_command_error')
  })
}

const STATUS_ERROR_CODE = 400

test('utils.status.show() statuses API errors are handled', async (t) => {
  await runWithApiMock(t, 'simple', { status: STATUS_ERROR_CODE })
})

test('utils.status.show() statuses are sent to the API without colors', async (t) => {
  await runWithApiMock(t, 'colors')
})

test('report error statuses from failBuild()', async (t) => {
  await runWithApiMock(t, 'error_fail_build')
})

test('report error statuses from failPlugin()', async (t) => {
  await runWithApiMock(t, 'error_fail_plugin')
})

test('report error statuses from cancelBuild()', async (t) => {
  await runWithApiMock(t, 'error_cancel_build')
})

test('does not report error statuses from build.command errors', async (t) => {
  await runWithApiMock(t, 'error_build_command')
})

test('report error statuses from uncaught exceptions with static properties', async (t) => {
  await runWithApiMock(t, 'error_properties')
})

test('report error statuses from uncaught exceptions during plugin load', async (t) => {
  await runWithApiMock(t, 'error_load_uncaught')
})

test('report error statuses from uncaught exceptions during onSuccess', async (t) => {
  await runWithApiMock(t, 'error_onsuccess')
})

test('report error statuses from uncaught exceptions during onEnd', async (t) => {
  await runWithApiMock(t, 'error_onend')
})

test('report error statuses from plugin invalid shape', async (t) => {
  await runWithApiMock(t, 'error_plugin_shape')
})

test('report error statuses from plugin inputs validation', async (t) => {
  await runWithApiMock(t, 'error_inputs_validation')
})

test('report error statuses from plugin loads with other plugins loading', async (t) => {
  await runWithApiMock(t, 'error_plugin_load')
})

const runUtilsStatusShow = function (t, argument) {
  return runFixture(t, 'show_util', { env: { SHOW_ARG: JSON.stringify(argument) } })
}

test('utils.status.show() does not fail', async (t) => {
  await runUtilsStatusShow(t, { title: 'title', summary: 'summary', text: 'text' })
})

test('utils.status.show() argument should be defined', async (t) => {
  await runUtilsStatusShow(t, '')
})

test('utils.status.show() argument should be an object', async (t) => {
  await runUtilsStatusShow(t, 'summary')
})

test('utils.status.show() argument should not contain typos', async (t) => {
  await runUtilsStatusShow(t, { titles: 'title', summary: 'summary', text: 'text' })
})

test('utils.status.show() requires a summary', async (t) => {
  await runUtilsStatusShow(t, { title: 'title', text: 'text' })
})

test('utils.status.show() allow other fields to be optional', async (t) => {
  await runUtilsStatusShow(t, { summary: 'summary' })
})

test('utils.status.show() title should be a string', async (t) => {
  await runUtilsStatusShow(t, { title: true, summary: 'summary', text: 'text' })
})

test('utils.status.show() title can be empty', async (t) => {
  await runUtilsStatusShow(t, { title: ' ', summary: 'summary', text: 'text' })
})

test('utils.status.show() summary should be a string', async (t) => {
  await runUtilsStatusShow(t, { title: 'title', summary: true, text: 'text' })
})

test('utils.status.show() summary should not be empty', async (t) => {
  await runUtilsStatusShow(t, { title: 'title', summary: ' ', text: 'text' })
})

test('utils.status.show() text should be a string', async (t) => {
  await runUtilsStatusShow(t, { title: 'title', summary: 'summary', text: true })
})

test('utils.status.show() text can be empty', async (t) => {
  await runUtilsStatusShow(t, { title: 'title', summary: 'summary', text: ' ' })
})
