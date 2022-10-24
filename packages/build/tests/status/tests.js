import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

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

const VERSION_REGEXP = /\d+\.\d+\.\d+(-\w+)?/g
const STACK_TRACE_REGEXP = /^\s+at .*/gm
const WHITESPACE_REGEXP = /\s+/g

const comparePackage = function ({ body: { package: packageA } }, { body: { package: packageB } }) {
  return packageA < packageB ? -1 : 1
}

test('utils.status.show() can override a success status', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/success_status_override')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() cannot override an error status with a success status', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_status_override')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() plugin error cannot override a build error', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_status_error_override')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() implicit status is not used when an explicit call was made', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/no_implicit')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() implicit status is not used when there are no events', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/no_implicit_none')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() implicit status is not used when plugin did not complete', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/no_implicit_incomplete')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() implicit status is not used when no call was made, with only onError', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/no_implicit_onerror')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() implicit status is used when no call was made', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/implicit_one')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() implicit status is used when no events have made a call', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/implicit_several')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() implicit status is used when no call was made, with only onEnd', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/implicit_onend')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() are printed locally', async (t) => {
  const output = await new Fixture('./fixtures/print').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() are not printed in production', async (t) => {
  const output = await new Fixture('./fixtures/print').withFlags({ mode: 'buildbot' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() statuses are sent to the API', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/print')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() statuses are not sent to the API without a token', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/print')
    .withFlags({ deployId: 'test', token: '', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() statuses are not sent to the API without a DEPLOY_ID', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/print')
    .withFlags({ deployId: '', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() statuses are sent to the API for core commands', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/core_command_error')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() statuses API errors are handled', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/simple')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH, status: 400 })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() statuses are sent to the API without colors', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/colors')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from failBuild()', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_fail_build')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from failPlugin()', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_fail_plugin')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from cancelBuild()', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_cancel_build')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('does not report error statuses from build.command errors', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_build_command')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from uncaught exceptions with static properties', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_properties')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from uncaught exceptions during plugin load', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_load_uncaught')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from uncaught exceptions during onSuccess', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_onsuccess')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from uncaught exceptions during onEnd', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_onend')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from plugin invalid shape', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_plugin_shape')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from plugin inputs validation', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_inputs_validation')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses from plugin loads with other plugins loading', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_plugin_load')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('report error statuses extraData from failBuild()', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/error_extra_info')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  t.snapshot(normalizeOutput(output))
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
})

test('utils.status.show() does not fail', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: 'text' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() argument should be defined', async (t) => {
  const output = await new Fixture('./fixtures/show_util').withEnv({ SHOW_ARG: JSON.stringify('') }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() argument should be an object', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({ SHOW_ARG: JSON.stringify('summary') })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() argument should not contain typos', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ titles: 'title', summary: 'summary', text: 'text' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() requires a summary', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', text: 'text' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() allow other fields to be optional', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({ SHOW_ARG: JSON.stringify({ summary: 'summary' }) })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() title should be a string', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: true, summary: 'summary', text: 'text' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() title can be empty', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: ' ', summary: 'summary', text: 'text' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() summary should be a string', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: true, text: 'text' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() summary should not be empty', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: ' ', text: 'text' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() text should be a string', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: true }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() text can be empty', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: ' ' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() extraData can be empty', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: ' ', extraData: [] }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('utils.status.show() extraData should be an array', async (t) => {
  const output = await new Fixture('./fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: ' ', extraData: '' }),
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})
