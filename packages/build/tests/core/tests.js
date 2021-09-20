'use strict'

const { unlink, writeFile } = require('fs')
const { join } = require('path')
const { kill, platform } = require('process')
const { promisify } = require('util')

const zipItAndShipIt = require('@netlify/zip-it-and-ship-it')
const test = require('ava')
const getNode = require('get-node')
const moize = require('moize')
const pathExists = require('path-exists')
const sinon = require('sinon')
const { tmpName } = require('tmp-promise')

const { runFixture: runFixtureConfig } = require('../../../config/tests/helpers/main')
const { version: netlifyBuildVersion } = require('../../package.json')
const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')
const { startServer } = require('../helpers/server')

const pWriteFile = promisify(writeFile)
const pUnlink = promisify(unlink)

test.afterEach.always(() => {
  if (zipItAndShipIt.zipFunctions.restore) {
    zipItAndShipIt.zipFunctions.restore()
  }
})

test('--help', async (t) => {
  await runFixture(t, '', { flags: { help: true }, useBinary: true })
})

test('--version', async (t) => {
  const { returnValue } = await runFixture(t, '', { flags: { version: true }, useBinary: true })
  t.is(returnValue, netlifyBuildVersion)
})

test('Exit code is 0 on success', async (t) => {
  const { exitCode } = await runFixture(t, 'empty', { useBinary: true, snapshot: false })
  t.is(exitCode, 0)
})

test('Exit code is 1 on build cancellation', async (t) => {
  const { exitCode } = await runFixture(t, 'cancel', { useBinary: true, snapshot: false })
  t.is(exitCode, 1)
})

test('Exit code is 2 on user error', async (t) => {
  const { exitCode } = await runFixture(t, '', { flags: { config: '/invalid' }, useBinary: true, snapshot: false })
  t.is(exitCode, 2)
})

test('Exit code is 3 on plugin error', async (t) => {
  const { exitCode } = await runFixture(t, 'plugin_error', { useBinary: true, snapshot: false })
  t.is(exitCode, 3)
})

test('Success is true on success', async (t) => {
  const {
    returnValue: { success },
  } = await runFixture(t, 'empty', { programmatic: true, snapshot: false })
  t.true(success)
})

test('Success is false on build cancellation', async (t) => {
  const {
    returnValue: { success },
  } = await runFixture(t, 'cancel', { programmatic: true, snapshot: false })
  t.false(success)
})

test('Success is false on failure', async (t) => {
  const {
    returnValue: { success },
  } = await runFixture(t, 'plugin_error', { programmatic: true, snapshot: false })
  t.false(success)
})

test('severityCode is 0 on success', async (t) => {
  const {
    returnValue: { severityCode },
  } = await runFixture(t, 'empty', { programmatic: true, snapshot: false })
  t.is(severityCode, 0)
})

test('severityCode is 1 on build cancellation', async (t) => {
  const {
    returnValue: { severityCode },
  } = await runFixture(t, 'cancel', { programmatic: true, snapshot: false })
  t.is(severityCode, 1)
})

test('severityCode is 2 on user error', async (t) => {
  const {
    returnValue: { severityCode },
  } = await runFixture(t, '', { flags: { config: '/invalid' }, programmatic: true, snapshot: false })
  t.is(severityCode, 2)
})

test('severityCode is 3 on plugin error', async (t) => {
  const {
    returnValue: { severityCode },
  } = await runFixture(t, 'plugin_error', { programmatic: true, snapshot: false })
  t.is(severityCode, 3)
})

test('returns config mutations', async (t) => {
  const {
    returnValue: { configMutations },
  } = await runFixture(t, 'plugin_mutations', { programmatic: true, snapshot: false })

  t.deepEqual(configMutations, [
    {
      keys: ['redirects'],
      keysString: 'redirects',
      value: [{ from: 'api/*', to: '.netlify/functions/:splat', status: 200 }],
      event: 'onPreBuild',
    },
  ])
})

test('--cwd', async (t) => {
  await runFixture(t, '', { flags: { cwd: `${FIXTURES_DIR}/publish` } })
})

test('--repository-root', async (t) => {
  await runFixture(t, '', { flags: { repositoryRoot: `${FIXTURES_DIR}/empty` } })
})

test('--config', async (t) => {
  await runFixture(t, '', { flags: { config: `${FIXTURES_DIR}/empty/netlify.toml` } })
})

test('--defaultConfig CLI flag', async (t) => {
  const defaultConfig = JSON.stringify({ build: { command: 'echo commandDefault' } })
  await runFixture(t, 'empty', { flags: { defaultConfig }, useBinary: true })
})

test('--defaultConfig', async (t) => {
  const defaultConfig = { build: { command: 'echo commandDefault' } }
  await runFixture(t, 'empty', { flags: { defaultConfig } })
})

test('--cachedConfig CLI flag', async (t) => {
  const { returnValue } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
  await runFixture(t, 'cached_config', { flags: { cachedConfig: returnValue }, useBinary: true })
})

test('--cachedConfigPath CLI flag', async (t) => {
  const cachedConfigPath = await tmpName()
  try {
    await runFixtureConfig(t, 'cached_config', {
      flags: { output: cachedConfigPath },
      snapshot: false,
      useBinary: true,
    })
    await runFixture(t, 'cached_config', { flags: { cachedConfigPath, context: 'test' }, useBinary: true })
  } finally {
    await pUnlink(cachedConfigPath)
  }
})

test('--cachedConfig', async (t) => {
  const { returnValue } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
  const cachedConfig = JSON.parse(returnValue)
  await runFixture(t, 'cached_config', { flags: { cachedConfig } })
})

test('--cachedConfigPath', async (t) => {
  const cachedConfigPath = await tmpName()
  try {
    const { returnValue } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
    await pWriteFile(cachedConfigPath, returnValue)
    await runFixture(t, 'cached_config', { flags: { cachedConfigPath, context: 'test' } })
  } finally {
    await pUnlink(cachedConfigPath)
  }
})

test('--context', async (t) => {
  await runFixture(t, 'context', { flags: { context: 'testContext' } })
})

test('--branch', async (t) => {
  await runFixture(t, 'context', { flags: { branch: 'testContext' } })
})

test('--baseRelDir', async (t) => {
  await runFixtureConfig(t, 'basereldir', { flags: { baseRelDir: false } })
})

test('User error', async (t) => {
  await runFixture(t, '', { flags: { config: '/invalid' } })
})

test('No configuration file', async (t) => {
  await runFixture(t, 'none')
})

test('--dry with one event', async (t) => {
  await runFixture(t, 'single', { flags: { dry: true } })
})

test('--dry with several events', async (t) => {
  await runFixture(t, 'several', { flags: { dry: true } })
})

test('--dry-run', async (t) => {
  await runFixture(t, 'single', { flags: { dryRun: true }, useBinary: true })
})

test('--dry with build.command but no netlify.toml', async (t) => {
  await runFixture(t, 'none', { flags: { dry: true, defaultConfig: { build: { command: 'echo' } } } })
})

const CHILD_NODE_VERSION = '10.17.0'
const VERY_OLD_NODE_VERSION = '4.0.0'

// Try `get-node` several times because it sometimes fails due to network failures
const getNodeBinary = async function (nodeVersion, retries = 1) {
  try {
    return await getNode(nodeVersion)
  } catch (error) {
    if (retries < MAX_RETRIES) {
      return getNodeBinary(nodeVersion, retries + 1)
    }

    throw error
  }
}

const MAX_RETRIES = 10

// Memoize `get-node`
// eslint-disable-next-line no-magic-numbers
const mGetNode = moize(getNodeBinary, { isPromise: true, maxSize: 1e3 })

test('--node-path is used by build.command', async (t) => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  await runFixture(t, 'build_command', { flags: { nodePath: path }, env: { TEST_NODE_PATH: path } })
})

test('--node-path is not used by local plugins', async (t) => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  await runFixture(t, 'local_node_path_unused', { flags: { nodePath: path }, env: { TEST_NODE_PATH: path } })
})

test('--node-path is not used by plugins added to package.json', async (t) => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  await runFixture(t, 'package_node_path_unused', { flags: { nodePath: path }, env: { TEST_NODE_PATH: path } })
})

test('--node-path is not used by core plugins', async (t) => {
  const { path } = await mGetNode(VERY_OLD_NODE_VERSION)
  await runFixture(t, 'core', { flags: { nodePath: path } })
})

test('featureFlags can be used programmatically', async (t) => {
  await runFixture(t, 'empty', { flags: { featureFlags: { test: true, testTwo: false } } })
})

test('featureFlags can be used in the CLI', async (t) => {
  await runFixture(t, 'empty', { flags: { featureFlags: { test: true, testTwo: false } }, useBinary: true })
})

test('featureFlags can be not used', async (t) => {
  await runFixture(t, 'empty', { flags: { featureFlags: undefined } })
})

const CANCEL_PATH = '/api/v1/deploys/test/cancel'

const runWithApiMock = async function (t, flags) {
  const { scheme, host, requests, stopServer } = await startServer({ path: CANCEL_PATH })
  try {
    await runFixture(t, 'cancel', { flags: { apiHost: host, testOpts: { scheme }, ...flags } })
  } finally {
    await stopServer()
  }
  return requests
}

test('--apiHost is used to set Netlify API host', async (t) => {
  const requests = await runWithApiMock(t, { token: 'test', deployId: 'test' })
  t.is(requests.length, 1)
  t.snapshot(requests)
})

test('Print warning when redirects file is missing from publish directory', async (t) => {
  await runFixture(t, 'missing_redirects_warning')
})

test('Does not print warning when redirects file is not missing from publish directory', async (t) => {
  await runFixture(t, 'missing_redirects_present')
})

test('Does not print warning when redirects file is missing from the build directory', async (t) => {
  await runFixture(t, 'missing_redirects_absent')
})

test('Does not print warning when redirects file is missing both from the build directory and the publish directory', async (t) => {
  await runFixture(t, 'missing_redirects_none')
})

test('Print warning for missing redirects file even with a base directory', async (t) => {
  await runFixture(t, 'missing_redirects_base')
})

test('Print warning when headers file is missing from publish directory', async (t) => {
  await runFixture(t, 'missing_headers_warning')
})

test.serial('Successfully builds ES module function with feature flag', async (t) => {
  const spy = sinon.spy(zipItAndShipIt, 'zipFunctions')

  await runFixture(t, 'functions_es_modules', {
    flags: { featureFlags: { buildbot_es_modules_esbuild: true } },
  })

  const { args: callArgs } = spy.getCall(0)
  t.true(callArgs[2].featureFlags.defaultEsModulesToEsbuild)
})

test.serial(`Doesn't fail build for ES module function if feature flag is off`, async (t) => {
  const spy = sinon.spy(zipItAndShipIt, 'zipFunctions')

  await runFixture(t, 'functions_es_modules', {
    flags: { featureFlags: { buildbot_es_modules_esbuild: false } },
  })

  const { args: callArgs } = spy.getCall(0)
  t.false(callArgs[2].featureFlags.defaultEsModulesToEsbuild)
})

test('Print warning on lingering processes', async (t) => {
  const { returnValue } = await runFixture(t, 'lingering', {
    flags: { testOpts: { silentLingeringProcesses: false }, mode: 'buildbot' },
    snapshot: false,
  })

  // Cleanup the lingering process
  const [, pid] = PID_LINE_REGEXP.exec(returnValue)
  kill(pid)

  t.true(returnValue.includes('the following processes were still running'))
  t.true(returnValue.includes(platform === 'win32' ? 'node.exe' : 'forever.js'))
})

const PID_LINE_REGEXP = /^PID: (\d+)$/m

test('Functions config is passed to zip-it-and-ship-it (1)', async (t) => {
  await runFixture(t, 'functions_config_1')
})

test('Functions config is passed to zip-it-and-ship-it (2)', async (t) => {
  await runFixture(t, 'functions_config_2')
})

test('Functions config is passed to zip-it-and-ship-it (3)', async (t) => {
  await runFixture(t, 'functions_config_3')
})

test('Functions schedule is parsed (1)', async (t) => {
  await runFixture(t, 'functions_schedule_1')
})

test('Functions schedule is parsed (2)', async (t) => {
  await runFixture(t, 'functions_schedule_2')
})

test('Functions schedule is parsed (3)', async (t) => {
  await runFixture(t, 'functions_schedule_3')
})

test('Shows notice about bundling errors and warnings coming from esbuild', async (t) => {
  await runFixture(t, 'esbuild_errors_1')
})

test('Shows notice about modules with dynamic imports and suggests the usage of `functions.external_node_modules`', async (t) => {
  await runFixture(t, 'esbuild_errors_2')
})

test('Bundles functions from the `.netlify/functions-internal` directory', async (t) => {
  await runFixture(t, 'functions_internal')
})

test('Does not require the `.netlify/functions-internal` directory to exist', async (t) => {
  await runFixture(t, 'functions_internal_missing')
})

test('Does not require the `.netlify/functions-internal` or the user functions directory to exist', async (t) => {
  await runFixture(t, 'functions_internal_user_missing')
})

test('Bundles functions from the `.netlify/functions-internal` directory even if the configured user functions directory is missing', async (t) => {
  await runFixture(t, 'functions_user_missing')
})

// eslint-disable-next-line max-statements
test.serial('`rustTargetDirectory` is passed to zip-it-and-ship-it only when running in buildbot', async (t) => {
  const fixtureWithConfig = 'functions_config_1'
  const fixtureWithoutConfig = 'functions_internal_missing'
  const runCount = 4
  const spy = sinon.spy(zipItAndShipIt, 'zipFunctions')

  await runFixture(t, fixtureWithConfig, { flags: { mode: 'buildbot' }, snapshot: false })
  await runFixture(t, fixtureWithConfig, { snapshot: false })
  await runFixture(t, fixtureWithoutConfig, { flags: { mode: 'buildbot' }, snapshot: false })
  await runFixture(t, fixtureWithoutConfig, { snapshot: false })

  t.is(spy.callCount, runCount)

  const { args: call1Args } = spy.getCall(0)
  const { args: call2Args } = spy.getCall(1)
  const { args: call3Args } = spy.getCall(2)
  const { args: call4Args } = spy.getCall(3)

  t.is(
    call1Args[2].config['*'].rustTargetDirectory,
    join(FIXTURES_DIR, fixtureWithConfig, '.netlify', 'rust-functions-cache', '[name]'),
  )
  t.is(call2Args[2].config['*'].rustTargetDirectory, undefined)
  t.is(
    call3Args[2].config['*'].rustTargetDirectory,
    join(FIXTURES_DIR, fixtureWithoutConfig, '.netlify', 'rust-functions-cache', '[name]'),
  )
  t.is(call4Args[2].config['*'].rustTargetDirectory, undefined)
})

test('Does not generate a `manifest.json` file when the feature flag is not enabled', async (t) => {
  const fixtureName = 'functions_internal_no_manifest_2'

  await removeDir(`${FIXTURES_DIR}/${fixtureName}/.netlify/functions`)
  await runFixture(t, fixtureName, { flags: { mode: 'buildbot' }, snapshot: false })

  t.false(await pathExists(`${FIXTURES_DIR}/${fixtureName}/.netlify/functions/manifest.json`))
})

test('Does not generate a `manifest.json` file when running in buildbot', async (t) => {
  const fixtureName = 'functions_internal_no_manifest_1'

  await removeDir(`${FIXTURES_DIR}/${fixtureName}/.netlify/functions`)
  await runFixture(t, fixtureName, {
    flags: { featureFlags: { functionsBundlingManifest: true }, mode: 'buildbot' },
    snapshot: false,
  })

  t.false(await pathExists(`${FIXTURES_DIR}/${fixtureName}/.netlify/functions/manifest.json`))
})

test('Generates a `manifest.json` file when running outside of buildbot', async (t) => {
  const fixtureName = 'functions_internal_manifest'

  await removeDir(`${FIXTURES_DIR}/${fixtureName}/.netlify/functions`)
  await runFixture(t, fixtureName, { flags: { featureFlags: { functionsBundlingManifest: true }, mode: 'cli' } })

  const manifestPath = `${FIXTURES_DIR}/${fixtureName}/.netlify/functions/manifest.json`

  t.true(await pathExists(manifestPath))

  // eslint-disable-next-line import/no-dynamic-require, node/global-require
  const { functions, timestamp, version: manifestVersion } = require(manifestPath)

  t.is(functions.length, 3)
  t.is(typeof timestamp, 'number')
  t.is(manifestVersion, 1)
})
