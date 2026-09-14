import { Fixture, normalizeOutput, type Request } from '@netlify/testing'
import { expect, test } from 'vitest'

const STATUS_PATH = '/api/v1/deploys/test/plugin_runs'

interface PluginRunBody {
  package: string
  version?: string
  text?: unknown
  [key: string]: unknown
}

const isPluginRunBody = (body: object): body is PluginRunBody => 'package' in body

const getPluginRunBody = ({ body }: Request): PluginRunBody => {
  if (typeof body === 'string' || !isPluginRunBody(body)) {
    throw new Error('Plugin run request body is missing "package"')
  }
  return body
}

// Normalize API request body so it can be snapshot in a stable way
const normalizeRequest = function (request: Request) {
  const { version, text, ...body } = getPluginRunBody(request)
  const versionA = version === undefined ? version : version.replace(VERSION_REGEXP, '1.0.0')
  const textA = normalizeText(text)
  return { ...request, body: { ...body, version: versionA, text: textA } }
}

const normalizeText = function (text: unknown) {
  if (typeof text !== 'string') {
    return text
  }

  return text.replace(STACK_TRACE_REGEXP, '').replace(WHITESPACE_REGEXP, ' ').trim()
}

const VERSION_REGEXP = /\d+\.\d+\.\d+(-\w+)?/g
const STACK_TRACE_REGEXP = /^\s+at .*/gm
const WHITESPACE_REGEXP = /\s+/g

const comparePackage = function (
  { body: { package: packageA } }: { body: PluginRunBody },
  { body: { package: packageB } }: { body: PluginRunBody },
) {
  return packageA < packageB ? -1 : 1
}

test('utils.status.show() can override a success status', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/success_status_override')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() cannot override an error status with a success status', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_status_override')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() plugin error cannot override a build error', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_status_error_override')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() implicit status is not used when an explicit call was made', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/no_implicit')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() implicit status is not used when there are no events', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/no_implicit_none')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() implicit status is not used when plugin did not complete', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/no_implicit_incomplete')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() implicit status is not used when no call was made, with only onError', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/no_implicit_onerror')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() implicit status is used when no call was made', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/implicit_one')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() implicit status is used when no events have made a call', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/implicit_several')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() implicit status is used when no call was made, with only onEnd', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/implicit_onend')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() are printed locally', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/print').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() are not printed in production', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/print').withFlags({ mode: 'buildbot' }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() statuses are sent to the API', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/print')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() statuses are not sent to the API without a token', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/print')
    .withFlags({ deployId: 'test', token: '', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() statuses are not sent to the API without a DEPLOY_ID', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/print')
    .withFlags({ deployId: '', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() statuses are sent to the API for core commands', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/core_command_error')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() statuses API errors are handled', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/simple')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH, status: 400 })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() statuses are sent to the API without colors', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/colors')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from failBuild()', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_fail_build')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from failPlugin()', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_fail_plugin')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from cancelBuild()', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_cancel_build')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('does not report error statuses from build.command errors', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_build_command')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from uncaught exceptions with static properties', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_properties')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from uncaught exceptions during plugin load', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_load_uncaught')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from uncaught exceptions during onSuccess', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_onsuccess')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from uncaught exceptions during onEnd', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_onend')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from plugin invalid shape', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_plugin_shape')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from plugin inputs validation', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_inputs_validation')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses from plugin loads with other plugins loading', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_plugin_load')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('report error statuses extraData from failBuild()', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/error_extra_info')
    .withFlags({ deployId: 'test', token: 'test', sendStatus: true })
    .runBuildServer({ path: STATUS_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  expect(snapshots).toMatchSnapshot()
})

test('utils.status.show() does not fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: 'text' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() argument should be defined', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({ SHOW_ARG: JSON.stringify('') })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() argument should be an object', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({ SHOW_ARG: JSON.stringify('summary') })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() argument should not contain typos', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ titles: 'title', summary: 'summary', text: 'text' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() requires a summary', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', text: 'text' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() allow other fields to be optional', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({ SHOW_ARG: JSON.stringify({ summary: 'summary' }) })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() title should be a string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: true, summary: 'summary', text: 'text' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() title can be empty', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: ' ', summary: 'summary', text: 'text' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() summary should be a string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: true, text: 'text' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() summary should not be empty', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: ' ', text: 'text' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() text should be a string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: true }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() text can be empty', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: ' ' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() extraData can be empty', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: ' ', extraData: [] }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('utils.status.show() extraData should be an array', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/show_util')
    .withEnv({
      SHOW_ARG: JSON.stringify({ title: 'title', summary: 'summary', text: ' ', extraData: '' }),
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
