const test = require('ava')

const { runFixture } = require('../helpers/main')
const { startUdpServer } = require('../helpers/udp_server')

test('Sends timings to --statsd.host|port', async t => {
  t.snapshot(await getTimerRequestsString(t, 'simple'))
})

test('Sends timings of plugins', async t => {
  t.snapshot(await getTimerRequestsString(t, 'plugin'))
})

test('Allow passing --framework CLI flag', async t => {
  const timerRequests = await getAllTimerRequests(t, 'simple', { framework: 'test' })
  t.true(timerRequests.every(timerRequest => timerRequest.includes('framework:test')))
})

test('Default --framework CLI flag to nothing', async t => {
  const timerRequests = await getAllTimerRequests(t, 'simple')
  t.true(timerRequests.every(timerRequest => !timerRequest.includes('framework:')))
})

// Retrieve statsd packets sent to --statsd.host|port, and get their snapshot
const getTimerRequestsString = async function(t, fixtureName, flags) {
  const timerRequests = await getAllTimerRequests(t, fixtureName, flags)
  const timerRequestsString = serializeTimerRequests(timerRequests)
  return timerRequestsString
}

const getAllTimerRequests = async function(t, fixtureName, flags = {}) {
  const { host, port, requests, stopServer } = await startUdpServer()
  try {
    await runFixture(t, fixtureName, { flags: { statsd: { host, port }, ...flags }, snapshot: false })
  } finally {
    await stopServer()
  }

  const timerRequests = requests.flatMap(flattenRequest)
  return timerRequests
}

const flattenRequest = function(request) {
  return request.trim().split('\n')
}

const serializeTimerRequests = function(timerRequests) {
  return timerRequests
    .map(normalizeRequest)
    .sort()
    .join('\n')
    .trim()
}

const normalizeRequest = function(request) {
  return request.replace(NUMBERS_REGEXP, 0)
}

const NUMBERS_REGEXP = /\d+/g
