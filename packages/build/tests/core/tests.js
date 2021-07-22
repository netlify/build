'use strict'

const { unlink, writeFile } = require('fs')
const { kill, platform, version } = require('process')
const { promisify } = require('util')

const test = require('ava')
const getNode = require('get-node')
const moize = require('moize')
const { tmpName } = require('tmp-promise')

const { runFixture: runFixtureConfig } = require('../../../config/tests/helpers/main')
const { version: netlifyBuildVersion } = require('../../package.json')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')
const { startServer } = require('../helpers/server')

const pWriteFile = promisify(writeFile)
const pUnlink = promisify(unlink)

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

const CHILD_NODE_VERSION = '8.3.0'
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

// @netlify/zip-it-and-ship-it does not support Node 8 during bundling
// TODO: remove once we drop support for Node 8
if (!version.startsWith('v8.')) {
  test('--node-path is not used by core plugins', async (t) => {
    const { path } = await mGetNode(VERY_OLD_NODE_VERSION)
    await runFixture(t, 'core', { flags: { nodePath: path } })
  })
}

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

// @netlify/zip-it-and-ship-it does not support Node 8 during bundling
// TODO: remove once we drop support for Node 8
if (!version.startsWith('v8.')) {
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
}
