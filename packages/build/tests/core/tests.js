const { platform, execPath } = require('process')

const test = require('ava')
const getNode = require('get-node')
const moize = require('moize').default

const { runFixture: runFixtureConfig } = require('../../../config/tests/helpers/main')
const { version } = require('../../package.json')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')
const { startServer } = require('../helpers/server.js')

test('--help', async t => {
  await runFixture(t, '', { flags: { help: true }, useBinary: true })
})

test('--version', async t => {
  const { returnValue } = await runFixture(t, '', { flags: { version: true }, useBinary: true })
  t.is(returnValue, version)
})

test('Exit code is 0 on success', async t => {
  const { exitCode } = await runFixture(t, 'empty', { useBinary: true, snapshot: false })
  t.is(exitCode, 0)
})

test('Exit code is 1 on build cancellation', async t => {
  const { exitCode } = await runFixture(t, 'cancel', { useBinary: true, snapshot: false })
  t.is(exitCode, 1)
})

test('Exit code is 2 on user error', async t => {
  const { exitCode } = await runFixture(t, '', { flags: { config: '/invalid' }, useBinary: true, snapshot: false })
  t.is(exitCode, 2)
})

test('Exit code is 3 on plugin error', async t => {
  const { exitCode } = await runFixture(t, 'plugin_error', { useBinary: true, snapshot: false })
  t.is(exitCode, 3)
})

test('Success is true on success', async t => {
  const {
    returnValue: { success },
  } = await runFixture(t, 'empty', { programmatic: true, snapshot: false })
  t.true(success)
})

test('Success is false on build cancellation', async t => {
  const {
    returnValue: { success },
  } = await runFixture(t, 'cancel', { programmatic: true, snapshot: false })
  t.false(success)
})

test('Success is false on failure', async t => {
  const {
    returnValue: { success },
  } = await runFixture(t, 'plugin_error', { programmatic: true, snapshot: false })
  t.false(success)
})

test('severityCode is 0 on success', async t => {
  const {
    returnValue: { severityCode },
  } = await runFixture(t, 'empty', { programmatic: true, snapshot: false })
  t.is(severityCode, 0)
})

test('severityCode is 1 on build cancellation', async t => {
  const {
    returnValue: { severityCode },
  } = await runFixture(t, 'cancel', { programmatic: true, snapshot: false })
  t.is(severityCode, 1)
})

test('severityCode is 2 on user error', async t => {
  const {
    returnValue: { severityCode },
  } = await runFixture(t, '', { flags: { config: '/invalid' }, programmatic: true, snapshot: false })
  t.is(severityCode, 2)
})

test('severityCode is 3 on plugin error', async t => {
  const {
    returnValue: { severityCode },
  } = await runFixture(t, 'plugin_error', { programmatic: true, snapshot: false })
  t.is(severityCode, 3)
})

test('--cwd', async t => {
  await runFixture(t, '', { flags: { cwd: `${FIXTURES_DIR}/empty` } })
})

test('--repository-root', async t => {
  await runFixture(t, '', { flags: { repositoryRoot: `${FIXTURES_DIR}/empty` } })
})

test('--config', async t => {
  await runFixture(t, '', { flags: { config: `${FIXTURES_DIR}/empty/netlify.toml` } })
})

test('--defaultConfig', async t => {
  const defaultConfig = JSON.stringify({ build: { command: 'echo commandDefault' } })
  await runFixture(t, 'empty', { flags: { defaultConfig } })
})

test('--cachedConfig', async t => {
  const { returnValue } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
  await runFixture(t, 'cached_config', { flags: { cachedConfig: returnValue } })
})

test('--context', async t => {
  await runFixture(t, 'context', { flags: { context: 'testContext' } })
})

test('--branch', async t => {
  await runFixture(t, 'context', { flags: { branch: 'testContext' } })
})

test('--baseRelDir', async t => {
  await runFixtureConfig(t, 'basereldir', { flags: { baseRelDir: false } })
})

test('User error', async t => {
  await runFixture(t, '', { flags: { config: '/invalid' } })
})

test('No configuration file', async t => {
  await runFixture(t, 'none')
})

test('--dry with one event', async t => {
  await runFixture(t, 'single', { flags: { dry: true } })
})

test('--dry with several events', async t => {
  await runFixture(t, 'several', { flags: { dry: true } })
})

test('--dry-run', async t => {
  await runFixture(t, 'single', { flags: { dryRun: true }, useBinary: true })
})

test('--dry with build.command but no netlify.toml', async t => {
  await runFixture(t, 'none', { flags: { dry: true, defaultConfig: '{"build":{"command":"echo"}}' } })
})

const CHILD_NODE_VERSION = '8.3.0'
const VERY_OLD_NODE_VERSION = '4.0.0'

// Try `get-node` several times because it sometimes fails due to network failures
const getNodeBinary = async function(version, retries = 1) {
  try {
    return await getNode(version)
  } catch (error) {
    if (retries < MAX_RETRIES) {
      return getNodeBinary(version, retries + 1)
    }

    throw error
  }
}

const MAX_RETRIES = 10

// Memoize `get-node`
const mGetNode = moize(getNodeBinary, { isPromise: true })

test('--node-path is used by build.command', async t => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  await runFixture(t, 'build_command', { flags: { nodePath: path }, env: { TEST_NODE_PATH: path } })
})

test('--node-path is used by local plugins', async t => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  await runFixture(t, 'local_node_path', { flags: { nodePath: path }, env: { TEST_NODE_PATH: path } })
})

test('--node-path is used by plugins added to package.json', async t => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  await runFixture(t, 'package', { flags: { nodePath: path }, env: { TEST_NODE_PATH: path } })
})

test('--node-path is not used by core plugins', async t => {
  const { path } = await mGetNode(VERY_OLD_NODE_VERSION)
  await runFixture(t, 'core', { flags: { nodePath: path } })
})

test('--node-path is not used by build-image cached plugins', async t => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  await runFixture(t, 'build_image', {
    flags: {
      nodePath: path,
      mode: 'buildbot',
      buildImagePluginsDir: `${FIXTURES_DIR}/build_image_cache/node_modules`,
    },
    env: { TEST_NODE_PATH: execPath },
  })
})

test('--featureFlags can be used', async t => {
  await runFixture(t, 'empty', { flags: { featureFlags: 'test,test,testTwo' } })
})

// Normalize telemetry request so it can be snapshot
const normalizeSnapshot = function({ body, ...request }) {
  return { ...request, body: normalizeBody(body) }
}

const normalizeBody = function({
  anonymousId,
  meta: { timestamp, ...meta } = {},
  properties: { duration, isCI, buildVersion, nodeVersion, osPlatform, osName, ...properties } = {},
  ...body
}) {
  return {
    ...body,
    anonymousId: typeof anonymousId,
    meta: { ...meta, timestamp: typeof timestamp },
    properties: {
      ...properties,
      duration: typeof duration,
      isCI: typeof isCI,
      buildVersion: typeof buildVersion,
      nodeVersion: typeof nodeVersion,
      osPlatform: typeof osPlatform,
      osName: typeof osName,
    },
  }
}

if (platform !== 'win32') {
  test('Print warning on lingering processes', async t => {
    const { returnValue } = await runFixture(t, 'lingering', {
      flags: { testOpts: { silentLingeringProcesses: false }, mode: 'buildbot' },
      snapshot: false,
    })

    // Cleanup the lingering process
    const [, pid] = PID_LINE_REGEXP.exec(returnValue)
    process.kill(pid)

    t.true(returnValue.includes('There are some lingering processes'))
    t.true(returnValue.includes('forever.js'))
  })

  const PID_LINE_REGEXP = /^PID: (\d+)$/m
}

const TELEMETRY_PATH = '/collect'

test('Telemetry success', async t => {
  const { scheme, host, requests, stopServer } = await startServer(TELEMETRY_PATH)
  await runFixture(t, 'success', {
    flags: { siteId: 'test', testOpts: { telemetryOrigin: `${scheme}://${host}` }, telemetry: true },
    snapshot: false,
  })
  await stopServer()
  const snapshot = requests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry disabled', async t => {
  const { scheme, host, requests, stopServer } = await startServer(TELEMETRY_PATH)
  await runFixture(t, 'success', {
    flags: { siteId: 'test', testOpts: { telemetryOrigin: `${scheme}://${host}` } },
    env: { BUILD_TELEMETRY_DISABLED: 'true' },
    snapshot: false,
  })
  await stopServer()
  t.is(requests.length, 0)
})

test('Telemetry disabled with flag', async t => {
  const { scheme, host, requests, stopServer } = await startServer(TELEMETRY_PATH)
  await runFixture(t, 'success', {
    flags: { siteId: 'test', testOpts: { telemetryOrigin: `${scheme}://${host}` }, telemetry: false },
    snapshot: false,
  })
  await stopServer()
  t.is(requests.length, 0)
})

test('Telemetry disabled with mode', async t => {
  const { scheme, host, requests, stopServer } = await startServer(TELEMETRY_PATH)
  await runFixture(t, 'success', {
    flags: { siteId: 'test', testOpts: { telemetryOrigin: `${scheme}://${host}` }, telemetry: undefined },
    snapshot: false,
  })
  await stopServer()
  t.is(requests.length, 0)
})

test('Telemetry error', async t => {
  const { stopServer } = await startServer(TELEMETRY_PATH)
  await runFixture(t, 'success', {
    flags: { siteId: 'test', testOpts: { telemetryOrigin: `https://...` }, telemetry: true },
  })
  await stopServer()
})
