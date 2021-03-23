'use strict'

const test = require('ava')
const uuid = require('uuid')

const { runFixture } = require('../helpers/main')
const { startServer } = require('../helpers/server.js')

// Normalize telemetry request so it can be snapshot
const normalizeSnapshot = function ({ body, ...request }) {
  return { ...request, body: normalizeBody(body) }
}

const normalizeBody = function ({
  timestamp,
  anonymousId,
  properties: { duration, buildVersion, nodeVersion, osPlatform, osName, ...properties } = {},
  ...body
}) {
  const optAnonymousId = anonymousId ? { anonymousId: uuid.validate(anonymousId) ? 'uuid' : 'invalid' } : {}
  const optDuration = duration ? { duration: typeof duration } : {}
  return {
    ...body,
    ...optAnonymousId,
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

const SITE_INFO_PATH = '/api/v1/sites/test'

const SITE_INFO_DATA = {
  id: 'test',
  user_id: 'its-me-test',
}

const TELEMETRY_PATH = '/track'

const runWithApiMock = async function (
  t,
  fixture,
  {
    env = {},
    snapshot = false,
    runApi = false,
    telemetry = true,
    featureFlags = 'buildbot_build_telemetry',
    waitTelemetryServer,
    ...flags
  } = {},
) {
  // Start the mock telemetry server
  const {
    scheme: schemeTelemetry,
    host: hostTelemetry,
    requests: telemetryRequests,
    stopServer: stopTelemetryServer,
  } = await startServer({
    path: TELEMETRY_PATH,
    wait: waitTelemetryServer,
  })
  const stopServers = [stopTelemetryServer]
  const testOpts = {
    telemetryOrigin: `${schemeTelemetry}://${hostTelemetry}`,
  }

  // Start the Netlify API server mock
  if (runApi) {
    const { host, scheme, stopServer: stopAPIServer } = await startServer({
      path: SITE_INFO_PATH,
      response: SITE_INFO_DATA,
    })
    stopServers.push(stopAPIServer)
    testOpts.scheme = scheme
    testOpts.host = host
  }

  try {
    const { exitCode } = await runFixture(t, fixture, {
      flags: { siteId: 'test', testOpts, telemetry, featureFlags, ...flags },
      env,
      snapshot,
    })
    return { exitCode, telemetryRequests }
  } finally {
    await Promise.all(stopServers.map((stopServer) => stopServer()))
  }
}

test('Telemetry success generates no logs', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry success with user id from site info', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    runApi: true,
    token: 'test',
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

test('Telemetry error generates no logs', async (t) => {
  await runWithApiMock(t, 'success', {
    origin: 'https://...',
    snapshot: true,
  })
})

test('Telemetry calls timeout by default', async (t) => {
  // Start the mock telemetry server
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    // eslint-disable-next-line no-magic-numbers
    waitTelemetryServer: 120000,
  })
  t.is(telemetryRequests.length, 0)
})
