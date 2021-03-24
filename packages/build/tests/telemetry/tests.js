'use strict'

const test = require('ava')

const { runFixture } = require('../helpers/main')
const { startServer } = require('../helpers/server.js')

// Normalize telemetry request so it can be snapshot
const normalizeSnapshot = function ({ body, ...request }) {
  return { ...request, body: normalizeBody(body) }
}

const normalizeBody = function ({
  timestamp,
  properties: { duration, buildVersion, nodeVersion, osPlatform, osName, ...properties } = {},
  ...body
}) {
  const optDuration = duration ? { duration: typeof duration } : {}
  return {
    ...body,
    timestamp: typeof timestamp,
    properties: {
      ...properties,
      ...optDuration,
      buildVersion: typeof buildVersion,
      nodeVersion: typeof nodeVersion,
      osPlatform: typeof osPlatform,
      osName: typeof osName,
    },
  }
}

const TELEMETRY_PATH = '/track'

const runWithApiMock = async function (
  t,
  fixture,
  {
    env = {},
    snapshot = false,
    telemetry = true,
    featureFlags = 'buildbot_build_telemetry',
    // Disables the timeout by default because of latency issues in the CI windows boxes
    disableTelemetryTimeout = true,
    waitTelemetryServer,
    ...flags
  } = {},
) {
  // Start the mock telemetry server
  const { scheme: schemeTelemetry, host: hostTelemetry, requests: telemetryRequests, stopServer } = await startServer({
    path: TELEMETRY_PATH,
    wait: waitTelemetryServer,
  })
  const testOpts = {
    // null disables the request timeout
    telemetryTimeout: disableTelemetryTimeout ? null : undefined,
    telemetryOrigin: `${schemeTelemetry}://${hostTelemetry}`,
  }

  try {
    const { exitCode } = await runFixture(t, fixture, {
      flags: { siteId: 'test', testOpts, telemetry, featureFlags, ...flags },
      env,
      snapshot,
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

test('Telemetry error generates no logs', async (t) => {
  await runWithApiMock(t, 'success', {
    origin: 'https://...',
    snapshot: true,
  })
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

test('Telemetry cannnot be enabled via flag if the feature flag is disabled', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    featureFlags: '',
    flags: {},
  })
  t.is(telemetryRequests.length, 0)
})

test('Telemetry BUILD_TELEMETRY_DISABLED env var overrides flag and feature flag usage', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    env: { BUILD_TELEMETRY_DISABLED: 'true' },
  })
  t.is(telemetryRequests.length, 0)
})

test('Telemetry calls timeout by default', async (t) => {
  // Start the mock telemetry server
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    // we want to rely on the default timeout value
    disableTelemetryTimeout: false,
    // eslint-disable-next-line no-magic-numbers
    waitTelemetryServer: 120000,
  })
  t.is(telemetryRequests.length, 0)
})
