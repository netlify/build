'use strict'

const test = require('ava')
const uuid = require('uuid')

const { trackBuildComplete } = require('../../src/telemetry/main')
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

const runWithApiMock = async function (t, fixture, { env = {}, snapshot = false, runApi = false, ...flags } = {}) {
  // Start the mock telemetry server
  const {
    scheme: schemeTelemetry,
    host: hostTelemetry,
    requests: telemetryRequests,
    stopServer: stopTelemetryServer,
  } = await startServer({
    path: TELEMETRY_PATH,
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
      flags: { siteId: 'test', testOpts, ...flags },
      env,
      snapshot,
    })
    return { exitCode, telemetryRequests }
  } finally {
    await Promise.all(stopServers.map((stopServer) => stopServer()))
  }
}

test('Telemetry success generates no logs', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', { telemetry: true })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry success with user id from site info', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    telemetry: true,
    runApi: true,
    token: 'test',
  })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports build cancellation', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'cancel', { telemetry: true })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports user error', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'invalid', { telemetry: true })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports plugin error', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'plugin_error', { telemetry: true })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry is disabled by default', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success')
  t.is(telemetryRequests.length, 0)
})

test('Telemetry can be enabled via flag', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', { telemetry: true })
  t.is(telemetryRequests.length, 1)
})

test('Telemetry BUILD_TELEMETRY_DISABLED env var overrides flag usage', async (t) => {
  const { telemetryRequests } = await runWithApiMock(t, 'success', {
    telemetry: true,
    env: { BUILD_TELEMETRY_DISABLED: 'true' },
  })
  t.is(telemetryRequests.length, 0)
})

test('Telemetry error generates no logs', async (t) => {
  await runWithApiMock(t, 'success', { origin: 'https://...', telemetry: true, snapshot: true })
})

test('Telemetry calls timeout in less than 1.3 seconds by default', async (t) => {
  // Start the mock telemetry server
  const { scheme: schemeTelemetry, host: hostTelemetry, requests, stopServer } = await startServer({
    path: TELEMETRY_PATH,
    // eslint-disable-next-line no-magic-numbers
    wait: 1300,
  })
  const testOpts = {
    telemetryOrigin: `${schemeTelemetry}://${hostTelemetry}`,
  }
  // eslint-disable-next-line no-magic-numbers
  await trackBuildComplete({ telemetry: true, testOpts })
  t.is(requests.length, 0)
  await stopServer()
})
