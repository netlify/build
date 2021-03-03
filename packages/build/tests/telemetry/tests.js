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

const TELEMETRY_PATH = '/track'

const runWithApiMock = async function (t, { telemetry, origin, env = {}, snapshot = false } = {}) {
  const { scheme, host, requests, stopServer } = await startServer({ path: TELEMETRY_PATH })
  const telemetryOrigin = origin || `${scheme}://${host}`
  try {
    await runFixture(t, 'success', {
      flags: { siteId: 'test', testOpts: { telemetryOrigin }, telemetry },
      env,
      snapshot,
    })
  } finally {
    await stopServer()
  }
  return requests
}

test('Telemetry success', async (t) => {
  const requests = await runWithApiMock(t, { telemetry: true })
  const snapshot = requests.map(normalizeSnapshot)
  t.snapshot(snapshot)
})

test('Telemetry disabled', async (t) => {
  const requests = await runWithApiMock(t, { env: { BUILD_TELEMETRY_DISABLED: 'true' } })
  t.is(requests.length, 0)
})

test('Telemetry disabled with flag', async (t) => {
  const requests = await runWithApiMock(t, { telemetry: false })
  t.is(requests.length, 0)
})

test('Telemetry disabled with mode', async (t) => {
  const requests = await runWithApiMock(t)
  t.is(requests.length, 0)
})

test('Telemetry error', async (t) => {
  await runWithApiMock(t, { origin: 'https://...', telemetry: true, snapshot: true })
})
