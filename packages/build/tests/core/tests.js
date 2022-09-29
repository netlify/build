import { promises as fs } from 'fs'
import { join } from 'path'
import { arch, kill, platform } from 'process'

import test from 'ava'
import getNode from 'get-node'
import moize from 'moize'
import { pathExists } from 'path-exists'
import sinon from 'sinon'
import { tmpName } from 'tmp-promise'

import { zipItAndShipIt } from '../../lib/plugins_core/functions/index.js'
import { importJsonFile } from '../../lib/utils/json.js'
import { runFixtureConfig } from '../helpers/config.js'
import { removeDir } from '../helpers/dir.js'
import { runFixture, FIXTURES_DIR } from '../helpers/main.js'
import { startServer } from '../helpers/server.js'

test('--help', async (t) => {
  await runFixture(t, '', { flags: { help: true }, useBinary: true })
})

test('--version', async (t) => {
  const { returnValue } = await runFixture(t, '', { flags: { version: true }, useBinary: true, cwd: FIXTURES_DIR })
  t.regex(returnValue, VERSION_REGEXP)
})

const VERSION_REGEXP = /^\d+\.\d+\.\d+/

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
    await fs.unlink(cachedConfigPath)
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
    await fs.writeFile(cachedConfigPath, returnValue)
    await runFixture(t, 'cached_config', { flags: { cachedConfigPath, context: 'test' } })
  } finally {
    await fs.unlink(cachedConfigPath)
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

const CHILD_NODE_VERSION = '12.19.0'
const VERY_OLD_NODE_VERSION = '4.0.0'

// Try `get-node` several times because it sometimes fails due to network failures
const getNodeBinary = async function (nodeVersion, retries = 1) {
  try {
    return await getNode(nodeVersion, {
      // there is no old node version for arm64 and MacOSX
      // just override it to always use x64 as it does not actually uses it.
      arch: platform === 'darwin' && arch === 'arm64' ? 'x64' : arch,
    })
  } catch (error) {
    if (retries < MAX_RETRIES) {
      return getNodeBinary(nodeVersion, retries + 1)
    }

    throw error
  }
}

const MAX_RETRIES = 10

// Memoize `get-node`
const GET_NODE_MOIZE_MAX_SIZE = 1e3
const mGetNode = moize(getNodeBinary, { isPromise: true, maxSize: GET_NODE_MOIZE_MAX_SIZE })

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
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)

  await runFixture(t, 'functions_es_modules', {
    flags: { featureFlags: { buildbot_es_modules_esbuild: true } },
  })

  stub.restore()

  const { args: callArgs } = mockZipFunctions.getCall(0)

  t.true(callArgs[2].featureFlags.defaultEsModulesToEsbuild)
})

test.serial(`Doesn't fail build for ES module function if feature flag is off`, async (t) => {
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)

  await runFixture(t, 'functions_es_modules', {
    flags: { featureFlags: { buildbot_es_modules_esbuild: false } },
  })

  stub.restore()

  const { args: callArgs } = mockZipFunctions.getCall(0)
  t.false(callArgs[2].featureFlags.defaultEsModulesToEsbuild)
})

test.serial('Passes the right properties to zip-it-and-ship-it', async (t) => {
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)
  const fixtureName = 'core'
  const fixtureDir = join(FIXTURES_DIR, fixtureName)

  await runFixture(t, fixtureName, { snapshot: false })
  await runFixture(t, fixtureName, {
    env: { AWS_LAMBDA_JS_RUNTIME: 'nodejs00.x' },
    flags: { mode: 'buildbot' },
    snapshot: false,
  })

  stub.restore()

  t.is(mockZipFunctions.callCount, 2)

  // eslint-disable-next-line prefer-destructuring
  const params1 = mockZipFunctions.firstCall.args[2]

  t.is(params1.basePath, fixtureDir)
  t.true(params1.config['*'].zipGo)
  t.is(params1.config['*'].includedFilesBasePath, fixtureDir)
  t.is(params1.config['*'].nodeVersion, undefined)
  t.is(params1.repositoryRoot, fixtureDir)

  // eslint-disable-next-line prefer-destructuring
  const params2 = mockZipFunctions.secondCall.args[2]

  t.is(params2.config['*'].nodeVersion, 'nodejs00.x')
  t.is(params2.config['*'].zipGo, undefined)
})

test.serial('Passes the right feature flags to zip-it-and-ship-it', async (t) => {
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)

  await runFixture(t, 'schedule', { snapshot: false })
  await runFixture(t, 'schedule', {
    flags: { featureFlags: { buildbot_zisi_trace_nft: true } },
    snapshot: false,
  })
  await runFixture(t, 'schedule', {
    flags: { featureFlags: { buildbot_zisi_esbuild_parser: true } },
    snapshot: false,
  })
  await runFixture(t, 'schedule', {
    flags: { featureFlags: { this_is_a_mock_flag: true, and_another_one: true } },
    snapshot: false,
  })

  stub.restore()

  t.is(mockZipFunctions.callCount, 4)

  t.false(mockZipFunctions.getCall(0).args[2].featureFlags.traceWithNft)
  t.false(mockZipFunctions.getCall(0).args[2].featureFlags.parseWithEsbuild)
  t.is(mockZipFunctions.getCall(0).args[2].config.test.schedule, '@daily')
  t.is(mockZipFunctions.getCall(0).args[2].featureFlags.this_is_a_mock_flag, undefined)
  t.is(mockZipFunctions.getCall(0).args[2].featureFlags.and_another_one, undefined)

  t.true(mockZipFunctions.getCall(1).args[2].featureFlags.traceWithNft)
  t.true(mockZipFunctions.getCall(2).args[2].featureFlags.parseWithEsbuild)
  t.true(mockZipFunctions.getCall(3).args[2].featureFlags.this_is_a_mock_flag)
  t.true(mockZipFunctions.getCall(3).args[2].featureFlags.and_another_one)
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

test.serial('`rustTargetDirectory` is passed to zip-it-and-ship-it only when running in buildbot', async (t) => {
  const fixtureWithConfig = 'functions_config_1'
  const fixtureWithoutConfig = 'functions_internal_missing'
  const runCount = 4
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)

  await runFixture(t, fixtureWithConfig, { flags: { mode: 'buildbot' }, snapshot: false })
  await runFixture(t, fixtureWithConfig, { snapshot: false })
  await runFixture(t, fixtureWithoutConfig, { flags: { mode: 'buildbot' }, snapshot: false })
  await runFixture(t, fixtureWithoutConfig, { snapshot: false })

  stub.restore()

  t.is(mockZipFunctions.callCount, runCount)

  const { args: call1Args } = mockZipFunctions.getCall(0)
  const { args: call2Args } = mockZipFunctions.getCall(1)
  const { args: call3Args } = mockZipFunctions.getCall(2)
  const { args: call4Args } = mockZipFunctions.getCall(3)

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

test.serial('configFileDirectories is passed to zip-it-and-ship-it', async (t) => {
  const fixture = 'functions_config_json'
  const runCount = 1
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)

  await runFixture(t, fixture, { flags: { mode: 'buildbot' }, snapshot: false })

  stub.restore()

  t.is(mockZipFunctions.callCount, runCount)

  const { args: call1Args } = mockZipFunctions.getCall(0)

  t.deepEqual(call1Args[2].configFileDirectories, [join(FIXTURES_DIR, fixture, '.netlify', 'functions-internal')])
})

test.serial('zip-it-and-ship-it runs without error when loading json config files', async (t) => {
  const fixture = 'functions_config_json'

  await runFixture(t, fixture, {
    flags: {
      mode: 'buildbot',
      featureFlags: { project_deploy_configuration_api_use_per_function_configuration_files: true },
    },
  })
})

test('Generates a `manifest.json` file when running outside of buildbot', async (t) => {
  const fixtureName = 'functions_internal_manifest'

  await removeDir(`${FIXTURES_DIR}/${fixtureName}/.netlify/functions`)
  await runFixture(t, fixtureName, { flags: { mode: 'cli' }, snapshot: false })

  const manifestPath = `${FIXTURES_DIR}/${fixtureName}/.netlify/functions/manifest.json`

  t.true(await pathExists(manifestPath))

  const { functions, timestamp, version: manifestVersion } = await importJsonFile(manifestPath)

  t.is(functions.length, 3)
  t.is(typeof timestamp, 'number')
  t.is(manifestVersion, 1)
})

test('Generates a `manifest.json` file when the `buildbot_create_functions_manifest` feature flag is set', async (t) => {
  const fixtureName = 'functions_internal_manifest'

  await removeDir(`${FIXTURES_DIR}/${fixtureName}/.netlify/functions`)
  await runFixture(t, fixtureName, {
    flags: { featureFlags: { buildbot_create_functions_manifest: true } },
    snapshot: false,
  })

  const manifestPath = `${FIXTURES_DIR}/${fixtureName}/.netlify/functions/manifest.json`

  t.true(await pathExists(manifestPath))

  const { functions, timestamp, version: manifestVersion } = await importJsonFile(manifestPath)

  t.is(functions.length, 3)
  t.is(typeof timestamp, 'number')
  t.is(manifestVersion, 1)
})
