import { platform } from 'process'

import { Fixture, normalizeOutput } from '@netlify/testing'
import hasAnsi from 'has-ansi'
import { expect, test, vi } from 'vitest'

import { addErrorInfo } from '../../lib/error/info.js'
import { zipItAndShipIt } from '../../lib/plugins_core/functions/index.js'

const BUGSNAG_TEST_KEY = '00000000000000000000000000000000'

test('Report build.command failure', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/command')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report configuration user error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/config')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report plugin input error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_input')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report plugin validation error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_validation')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report plugin internal error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_internal')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report utils.build.failBuild()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/monitor_fail_build')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report utils.build.failPlugin()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/monitor_fail_plugin')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report utils.build.cancelBuild()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cancel_build')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report IPC error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/ipc')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report API error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cancel_build')
    .withFlags({
      token: 'test',
      deployId: 'test',
      testOpts: { errorMonitor: true, env: true },
      bugsnagKey: BUGSNAG_TEST_KEY,
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

// ts-node prints error messages differently on Windows and does so in a way
// that is hard to normalize in test snapshots.
if (platform !== 'win32') {
  test('Report TypeScript error', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/typescript')
      .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
      .withCopyRoot({ git: false })
      .then((fixture) => fixture.runWithBuild())

    expect(output).toContain(`Could not import plugin:
  TSError: ⨯ Unable to compile TypeScript:
  plugin.ts(1,28): error TS2307: Cannot find module '@netlify/build' or its corresponding type declarations.
  plugin.ts(3,51): error TS7031: Binding element 'constants' implicitly has an 'any' type.`)
  })
}

test('Report dependencies error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/dependencies')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report buildbot mode as releaseStage', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/command')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY, mode: 'buildbot' })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report CLI mode as releaseStage', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/command')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY, mode: 'cli' })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report programmatic mode as releaseStage', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/command')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY, mode: 'require' })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Remove colors in error.message', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/colors')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  const lines = output.split('\n').filter((line) => line.includes('ColorTest'))
  expect(lines.every((line) => !hasAnsi(line))).toBe(true)
})

test('Report BUILD_ID', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/command')
    .withEnv({ BUILD_ID: 'test' })
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report plugin homepage', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_homepage')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report plugin homepage without a repository', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_homepage_no_repo')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report plugin origin', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_origin')
    .withFlags({
      defaultConfig: { plugins: [{ package: './plugin.js' }] },
      testOpts: { errorMonitor: true },
      bugsnagKey: BUGSNAG_TEST_KEY,
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Report build logs URLs', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/command')
    .withEnv({ DEPLOY_ID: 'testDeployId', SITE_NAME: 'testSiteName' })
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

// TODO: Snapshot normalizer is not handling Windows paths correctly. Figure
// out which regex is causing the problem and fix it.
if (platform !== 'win32') {
  test('Normalizes error messages resulting from bundling edge functions', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/edge_function_error')
      .withFlags({
        debug: false,
        testOpts: { errorMonitor: true },
        bugsnagKey: BUGSNAG_TEST_KEY,
      })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })
}

test('Normalizes error messages resulting from bundling TypeScript serverless functions', async () => {
  const customError = new Error(`Build failed with 2 errors:
  .netlify/functions-internal/server/chunks/app/server.mjs:6046:43: ERROR: Cannot assign to "foo" because it is a constant
  .netlify/functions-internal/server/node_modules/some-module/dist/mod.cjs.js:89:87: ERROR: No loader is configured for ".node" files: .netlify/functions-internal/server/node_modules/some-module/dist/binary.node`)

  addErrorInfo(customError, {
    location: { bundler: 'esbuild', functionName: 'trouble', runtime: 'js' },
    type: 'functionsBundling',
  })

  vi.spyOn(zipItAndShipIt, 'zipFunctions').mockImplementation(() => {
    throw customError
  })

  const output = await new Fixture(import.meta.url, './fixtures/serverless_function')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()

  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Normalizes error messages resulting from bundling Rust serverless functions', async () => {
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

  addErrorInfo(customError, {
    location: { functionName: 'trouble', runtime: 'rs' },
    type: 'functionsBundling',
  })

  vi.spyOn(zipItAndShipIt, 'zipFunctions').mockImplementation(() => {
    throw customError
  })

  const output = await new Fixture(import.meta.url, './fixtures/serverless_function')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('When an error has a `normalizedMessage` property, its value is used as the grouping hash', async () => {
  const customError = new Error('Cannot assign value "foo" to const "bar"')

  addErrorInfo(customError, {
    normalizedMessage: 'custom-grouping-hash',
    location: { bundler: 'esbuild', functionName: 'trouble', runtime: 'js' },
    type: 'functionsBundling',
  })

  vi.spyOn(zipItAndShipIt, 'zipFunctions').mockImplementation(() => {
    throw customError
  })

  const output = await new Fixture(import.meta.url, './fixtures/serverless_function')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Throws a user error when the wrong go version is used', async () => {
  const logs = await new Fixture(import.meta.url, './fixtures/go_version_error')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()

  expect(logs).toContain('"errorClass": "resolveConfig"')
})

test('Throws a dependency error when go dependency is missing', async () => {
  const logs = await new Fixture(import.meta.url, './fixtures/go_missing_dependency')
    .withFlags({ testOpts: { errorMonitor: true }, bugsnagKey: BUGSNAG_TEST_KEY })
    .runWithBuild()

  expect(logs).toContain('"errorClass": "dependencies"')
})
