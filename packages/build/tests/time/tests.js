'use strict'

const { version } = require('process')

const test = require('ava')

const { runFixture } = require('../helpers/main')
const { startUdpServer } = require('../helpers/udp_server')

test('Does not send plugin timings if no plugins', async (t) => {
  t.snapshot(await getTimerRequestsString(t, 'simple'))
})

test('Sends timings of Netlify maintained plugins', async (t) => {
  t.snapshot(await getTimerRequestsString(t, 'system_plugin'))
})

test('Does not send timings of community plugins', async (t) => {
  t.snapshot(await getTimerRequestsString(t, 'community_plugin'))
})

test('Sends distribution metrics', async (t) => {
  const timerRequests = await getAllTimerRequests(t, 'simple')
  const includesDistributionRequests = timerRequests.some((timerRequest) => timerRequest.includes('|d|'))

  t.true(includesDistributionRequests)
})

test('Allow passing --framework CLI flag', async (t) => {
  const timerRequests = await getAllTimerRequests(t, 'simple', { framework: 'test' })
  t.true(timerRequests.every((timerRequest) => timerRequest.includes('framework:test')))
})

test('Default --framework CLI flag to nothing', async (t) => {
  const timerRequests = await getAllTimerRequests(t, 'simple')
  t.true(timerRequests.every((timerRequest) => !timerRequest.includes('framework:')))
})

// @netlify/zip-it-and-ship-it does not support Node 8 during bundling
// TODO: remove once we drop support for Node 8
if (!version.startsWith('v8.')) {
  test('Sends a `bundler: "zisi"` tag when no functions use the esbuild bundler', async (t) => {
    const timerRequests = await getAllTimerRequests(t, 'functions_zisi')
    const functionsBundlingRequest = timerRequests.find((timerRequest) =>
      timerRequest.includes('stage:functions_bundling'),
    )

    t.true(functionsBundlingRequest.includes('bundler:zisi'))
  })

  test('Sends a `bundler: "esbuild"` tag when at least one function uses the esbuild bundler', async (t) => {
    const timerRequests = await getAllTimerRequests(t, 'functions_esbuild')
    const functionsBundlingRequest = timerRequests.find((timerRequest) =>
      timerRequest.includes('stage:functions_bundling'),
    )

    t.true(functionsBundlingRequest.includes('bundler:esbuild'))
  })
}

// Retrieve statsd packets sent to --statsd.host|port, and get their snapshot
const getTimerRequestsString = async function (t, fixtureName, flags) {
  const timerRequests = await getAllTimerRequests(t, fixtureName, flags)
  const timerRequestsString = serializeTimerRequests(timerRequests)
  return timerRequestsString
}

const getAllTimerRequests = async function (t, fixtureName, flags = {}) {
  const { host, port, requests, stopServer } = await startUdpServer()
  try {
    await runFixture(t, fixtureName, { flags: { statsd: { host, port }, ...flags }, snapshot: false })
  } finally {
    await stopServer()
  }

  const timerRequests = requests.flatMap(flattenRequest)
  return timerRequests
}

const flattenRequest = function (request) {
  return request.trim().split('\n')
}

const serializeTimerRequests = function (timerRequests) {
  return timerRequests.map(normalizeRequest).sort().join('\n').trim()
}

const normalizeRequest = function (request) {
  return request.replace(NUMBERS_REGEXP, 0)
}

const NUMBERS_REGEXP = /\d+/g
