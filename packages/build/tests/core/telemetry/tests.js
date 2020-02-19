const test = require('ava')

const { runFixture } = require('../../helpers/main')

const { startServer } = require('./server.js')

// Normalize telemetry request so it can be snapshot
const normalizeSnapshot = function({
  method,
  url,
  headers = {},
  body: {
    anonymousId,
    meta: { timestamp, ...meta } = {},
    properties: { duration, isCI, buildVersion, nodeVersion, osPlatform, osName, ...properties } = {},
    ...body
  } = {},
}) {
  return {
    method,
    url,
    headers: Object.keys(headers).sort(),
    body: {
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
    },
  }
}

test('Telemetry success', async t => {
  const { url, request, stopServer } = await startServer()
  await runFixture(t, 'success', {
    flags: '--site-id=test',
    env: { BUILD_TELEMETRY_DISABLED: '', BUILD_TELEMETRY_URL: url },
    snapshot: false,
  })
  await stopServer()
  const snapshot = normalizeSnapshot(request)
  t.snapshot(snapshot)
})

test('Telemetry disabled', async t => {
  const { url, request, stopServer } = await startServer()
  await runFixture(t, 'success', {
    flags: '--site-id=test',
    env: { BUILD_TELEMETRY_DISABLED: 'true', BUILD_TELEMETRY_URL: url },
    snapshot: false,
  })
  await stopServer()
  t.true(Object.keys(request).length === 0)
})

test('Telemetry error', async t => {
  const { stopServer } = await startServer()
  await runFixture(t, 'success', {
    flags: '--site-id=test',
    env: { BUILD_TELEMETRY_DISABLED: '', BUILD_TELEMETRY_URL: 'invalid' },
  })
  await stopServer()
})
