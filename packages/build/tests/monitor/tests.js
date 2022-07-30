import { platform } from 'process'

import test from 'ava'
import hasAnsi from 'has-ansi'
import sinon from 'sinon'

import { CUSTOM_ERROR_KEY } from '../../src/error/info.js'
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

test('Normalizes error messages resulting from bundling edge functions', async (t) => {
  await runFixture(t, 'edge_function_error', {
    flags: {
      ...flags,
      debug: false,
    },
  })
})

test.serial('Normalizes error messages resulting from bundling TypeScript serverless functions', async (t) => {
  const customError = new Error(`Build failed with 2 errors:
  .netlify/functions-internal/server/chunks/app/server.mjs:6046:43: ERROR: Cannot assign to "foo" because it is a constant
  .netlify/functions-internal/server/node_modules/@vue-leaflet/vue-leaflet/dist/vue-leaflet.cjs.js:89:87: ERROR: No loader is configured for ".node" files: .netlify/functions-internal/server/node_modules/bar/dist/baz.node`)

  customError[CUSTOM_ERROR_KEY] = {
    location: { bundler: 'esbuild', functionName: 'trouble', runtime: 'js' },
    type: 'functionsBundling',
  }

  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').throws(customError)

  await runFixture(t, 'serverless_function', { flags })

  stub.restore()
})

test.serial('Normalizes error messages resulting from bundling Rust serverless functions', async (t) => {
  const customError =
    new Error(`Command failed with exit code 101: cargo build --target x86_64-unknown-linux-musl --release
  Updating crates.io index
Downloading crates ...
Downloaded tokio v1.20.0
Downloaded tower v0.4.13
Downloaded serde v1.0.140
 Compiling tokio v1.20.0
 Compiling tower v0.4.13
 Compiling serde v1.0.140 (/opt/build/repo/netlify/functions/json-response)
error: expected one of \`!\` or \`::\`, found keyword \`use\`
--> src/main.rs:2:1
|
1 | KB
|   - expected one of \`!\` or \`::\`
2 | use aws_lambda_events::{
| ^^^ unexpected token`)

  customError[CUSTOM_ERROR_KEY] = {
    location: { functionName: 'trouble', runtime: 'rs' },
    type: 'functionsBundling',
  }

  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').throws(customError)

  await runFixture(t, 'serverless_function', { flags })

  stub.restore()
})

test.serial('When an error has a `normalizedMessage` property, its value is used as the grouping hash', async (t) => {
  const customError = new Error('Cannot assign value "foo" to const "bar"')

  customError[CUSTOM_ERROR_KEY] = {
    normalizedMessage: 'custom-grouping-hash',
    location: { bundler: 'esbuild', functionName: 'trouble', runtime: 'js' },
    type: 'functionsBundling',
  }

  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').throws(customError)

  await runFixture(t, 'serverless_function', { flags })

  stub.restore()
})
