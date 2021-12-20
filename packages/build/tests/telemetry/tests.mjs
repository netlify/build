import { versions } from 'process'

import test from 'ava'

import { runFixture } from '../helpers/main.js'
import { startServer } from '../helpers/server.js'

const TELEMETRY_PATH = '/track'
const BUGSNAG_TEST_KEY = '00000000000000000000000000000000'

// Normalize telemetry request so it can be snapshot
const normalizeSnapshot = function ({ body, ...request }) {
  return { ...request, body: normalizeBody(body) }
}

const normalizeBody = function ({
  timestamp,
  properties: { duration, buildVersion, osPlatform, osName, nodeVersion, plugins, ...properties } = {},
  ...body
}) {
  const optDuration = duration ? { duration: typeof duration } : {}
  return {
    ...body,
    timestamp: typeof timestamp,
    properties: {
      ...properties,
      ...optDuration,
      nodeVersion: typeof nodeVersion,
      buildVersion: typeof buildVersion,
      osPlatform: typeof osPlatform,
      osName: typeof osName,
      ...(plugins !== undefined && { plugins: plugins.map(normalizePlugin) }),
    },
  }
}

const normalizePlugin = function ({ nodeVersion, version, ...plugin }) {
  return { ...plugin, nodeVersion: typeof nodeVersion, version: typeof version }
}

const runWithApiMock = async function (
  t,
  fixture,
  {
    env = {},
    snapshot = false,
    telemetry = true,
    // Disables the timeout by default because of latency issues in the CI windows boxes
    disableTelemetryTimeout = true,
    responseStatusCode = 200,
    // By default, run build programmatically
    useBinary = false,
    waitTelemetryServer,
    ...flags
  } = {},
) {
  // Start the mock telemetry server
  const {
    scheme: schemeTelemetry,
    host: hostTelemetry,
    requests: telemetryRequests,
    stopServer,
  } = await startServer({
    path: TELEMETRY_PATH,
    wait: waitTelemetryServer,
    status: responseStatusCode,
  })
  const testOpts = {
    // null disables the request timeout
    telemetryTimeout: disableTelemetryTimeout ? null : undefined,
    telemetryOrigin: `${schemeTelemetry}://${hostTelemetry}`,
    // Any telemetry errors will be logged
    errorMonitor: true,
    ...flags.testOps,
  }

  try {
    const { exitCode } = await runFixture(t, fixture, {
      flags: { siteId: 'test', testOpts, telemetry, bugsnagKey: BUGSNAG_TEST_KEY, ...flags },
      env,
      snapshot,
      useBinary,
    })
    return { exitCode, telemetryRequests }
  } finally {
    await stopServer()
  }
}

test('Telemetry success generates no logs', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', { snapshot: true })
  t.is(telemetryRequests.length, 1)
})

test('Telemetry error only reports to error monitor and does not affect build success', async (t) => {
  const { exitCode } = await runWithApiMock(t, 'success', {
    responseStatusCode: 500,
    // Execute via cli so that we can validate the exitCode
    useBinary: true,
    snapshot: true,
  })
  t.is(exitCode, 0)
})

test('Telemetry reports build success', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports local plugins success', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'plugin_success')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports package.json plugins success', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'plugin_package')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports netlify.toml-only plugins success', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'plugins_cache_config', {
    testOps: { pluginsListUrl: undefined },
  })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports UI plugins success', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'plugins_cache_ui', {
    defaultConfig: { plugins: [{ package: 'netlify-plugin-contextual-env' }] },
    testOps: { pluginsListUrl: undefined },
  })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports build cancellation', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'cancel')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports user error', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'invalid')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports plugin error', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'plugin_error')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry is disabled by default', async (t) => {
  // We're just overriding our default test harness behaviour
  const { telemetryRequests } = await runWithApiMock(t, 'success', { telemetry: null })
  t.is(telemetryRequests.length, 0)
})

test('Telemetry BUILD_TELEMETRY_DISABLED env var overrides flag', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    env: { BUILD_TELEMETRY_DISABLED: 'true' },
  })
  t.is(telemetryRequests.length, 0)
})

test('Telemetry node version reported is based on the version provided by the user', async (t) => {
  const nodeVersion = '8.8.0'
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    nodePath: `/test/.nvm/versions/node/v${nodeVersion}/bin/node`,
  })
  t.is(telemetryRequests.length, 1)
  t.is(telemetryRequests[0].body.properties.nodeVersion, nodeVersion)
})

test('Telemetry node version reported is based on the current process version if none is provided', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success')
  t.is(telemetryRequests.length, 1)
  t.is(telemetryRequests[0].body.properties.nodeVersion, versions.node)
})

test('Telemetry reports a framework if any is given', async (t) => {
  const framework = 'gatsby'
  const { telemetryRequests } = await runWithApiMock(t, 'success', { framework })
  t.is(telemetryRequests.length, 1)
  t.is(telemetryRequests[0].body.properties.framework, framework)
})

test('Telemetry reports no framework if none is provided', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success')
  t.is(telemetryRequests.length, 1)
  t.is(telemetryRequests[0].body.properties.framework, undefined)
})

test('Telemetry reports the build id if given via BUILD_ID', async (t) => {
  const buildId = 'test-build-id'
  const { telemetryRequests } = await runWithApiMock(t, 'success', { env: { BUILD_ID: buildId } })
  t.is(telemetryRequests.length, 1)
  t.is(telemetryRequests[0].body.properties.buildId, buildId)
})

test('Telemetry reports a deploy id if given via DEPLOY_ID', async (t) => {
  const deployId = 'test-deploy-id'
  const { telemetryRequests } = await runWithApiMock(t, 'success', { env: { DEPLOY_ID: deployId } })
  t.is(telemetryRequests.length, 1)
  t.is(telemetryRequests[0].body.properties.deployId, deployId)
})

test('Telemetry reports a deploy id if given via --deployId flag', async (t) => {
  const deployId = 'test-deploy-id'
  const { telemetryRequests } = await runWithApiMock(t, 'success', { deployId })
  t.is(telemetryRequests.length, 1)
  t.is(telemetryRequests[0].body.properties.deployId, deployId)
})

test('Telemetry calls timeout by default', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    // We want to rely on the default timeout value
    disableTelemetryTimeout: false,
    // Introduce an arbitrary large timeout on the server side so that we can validate the client timeout works
    waitTelemetryServer: WAIT_TELEMETRY_SERVER,
    // The error monitor snapshot should contain the timeout error
    snapshot: true,
  })
  t.is(telemetryRequests.length, 0)
})

const WAIT_TELEMETRY_SERVER = 3e5
