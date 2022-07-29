import { platform } from 'process'

import test from 'ava'
import hasAnsi from 'has-ansi'
import sinon from 'sinon'

import { CUSTOM_ERROR_KEY } from '../../src/error/info.js'
import { normalizeGroupingMessage } from '../../src/error/monitor/normalize.js'
import { zipItAndShipIt } from '../../src/plugins_core/functions/index.js'
import { runFixture } from '../helpers/main.js'

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

test.serial('Report API error', async (t) => {
  await runFixture(t, 'cancel_build', {
    flags: { ...flags, token: 'test', deployId: 'test', testOpts: { ...flags.testOpts, env: false } },
  })
})

// ts-node prints error messages differently on Windows and does so in a way
// that is hard to normalize in test snapshots.
if (platform !== 'win32') {
  test('Report TypeScript error', async (t) => {
    await runFixture(t, 'typescript', { flags, copyRoot: { git: false } })
  })
}

test('Report dependencies error', async (t) => {
  await runFixture(t, 'dependencies', { flags })
})

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
  const defaultConfig = { plugins: [{ package: './plugin.js' }] }
  await runFixture(t, 'plugin_origin', { flags: { ...flags, defaultConfig } })
})

test('Report build logs URLs', async (t) => {
  await runFixture(t, 'command', {
    flags,
    env: { DEPLOY_ID: 'testDeployId', SITE_NAME: 'testSiteName' },
    useBinary: true,
  })
})

test.serial('When an error has a `normalizedMessage` property, its value is used as the grouping hash', async (t) => {
  const customError = new Error('Cannot assign value "foo" to const "bar"')

  customError[CUSTOM_ERROR_KEY] = {
    normalizedMessage: 'custom-grouping-hash',
    location: { bundler: 'esbuild', functionName: 'trouble', runtime: 'js' },
    type: 'functionsBundling',
  }

  // eslint-disable-next-line import/no-named-as-default-member
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').throws(customError)

  await runFixture(t, 'function_bundling_error', { flags })

  stub.restore()
})

test('Error messages are normalized', (t) => {
  const cases = [
    [
      'functionsBundling Command failed with exit code 1: /opt/build/repo/.netlify/plugins/deno-cli/deno bundle --import-map=data:application/json;base64,eyJpbXBvcnRzIjp7Im5ldGxpZnk6ZWRnZSI6Imh0dHBzOi8vZWRnZS5uZXRsaWZ5LmNvbS92MS9pbmRleC50cyJ9fQ== --quiet /tmp/edge-62e3a15d47b3340008b4b904/e6c2a079-8110-438d-b03d-ec2d2b6ca178-pre.js /tmp/edge-62e3a15d47b3340008b4b904/e6c2a079-8110-438d-b03d-ec2d2b6ca178.js',
      'functionsBundling Command failed with exit code 0: /file/path bundle --import-map=dataURI --quiet /file/path /tmp/edghex/hex.js',
    ],

    [
      'Bundling of function "server" failed\nBuild failed with 1 error: .netlify/functions-internal/server/node_modules/ufo/package.json:41:1: ERROR: Expected end of file but found ","',
      'Bundling of function "functionName" failed\nBuild failed with 0 error: /file/path ERROR: Expected end of file but found ","',
    ],
  ]

  cases.forEach(([original, expected]) => {
    t.is(normalizeGroupingMessage(original), expected)
  })
})
