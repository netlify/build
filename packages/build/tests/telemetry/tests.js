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
  { telemetryOrigin, env = {}, snapshot = false, runApi = false, ...flags } = {},
) {
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
  const testOpts = { telemetryOrigin: telemetryOrigin || `${schemeTelemetry}://${hostTelemetry}` }

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
    await runFixture(t, fixture, {
      flags: { siteId: 'test', testOpts, ...flags },
      env,
      testingTelemetry: true,
      snapshot,
    })
  } finally {
    stopServers.forEach((stopServer) => {
      stopServer()
    })
  }
  return telemetryRequests
}

test('Telemetry success generates no logs', async (t) => {
  const requests = await runWithApiMock(t, 'success', { telemetry: true })
  const snapshot = requests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry success with user id from site info', async (t) => {
  const requests = await runWithApiMock(t, 'success', {
    telemetry: true,
    runApi: true,
    token: 'test',
  })
  const snapshot = requests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports build cancellation', async (t) => {
  const requests = await runWithApiMock(t, 'cancel', { telemetry: true })
  const snapshot = requests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports user error', async (t) => {
  const requests = await runWithApiMock(t, 'invalid', { telemetry: true })
  const snapshot = requests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry reports plugin error', async (t) => {
  const requests = await runWithApiMock(t, 'plugin_error', { telemetry: true })
  const snapshot = requests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry enabled by default with mode cli', async (t) => {
  const requests = await runWithApiMock(t, 'success', { mode: 'cli' })
  t.is(requests.length, 1)
})

test('Telemetry disabled by default with mode require', async (t) => {
  const requests = await runWithApiMock(t, 'success', { mode: 'require' })
  t.is(requests.length, 0)
})

test('Telemetry enabled with mode require and flag', async (t) => {
  const requests = await runWithApiMock(t, 'success', { mode: 'buildbot', telemetry: true })
  t.is(requests.length, 1)
})

test('Telemetry enabled by default with mode buildbot', async (t) => {
  const requests = await runWithApiMock(t, 'success', { mode: 'buildbot' })
  t.is(requests.length, 1)
})

test('Telemetry disabled with mode buildbot and BUILD_TELEMETRY_DISABLED', async (t) => {
  const requests = await runWithApiMock(t, 'success', { mode: 'buildbot', env: { BUILD_TELEMETRY_DISABLED: 'true' } })
  t.is(requests.length, 0)
})

test('Telemetry disabled with mode buildbot and flag', async (t) => {
  const requests = await runWithApiMock(t, 'success', { mode: 'buildbot', telemetry: false })
  t.is(requests.length, 0)
})

test('Telemetry error generates no logs', async (t) => {
  await runWithApiMock(t, 'success', { origin: 'https://...', telemetry: true, snapshot: true })
})
