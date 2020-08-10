const test = require('ava')

const { runFixture } = require('../helpers/main')
const { startUdpServer } = require('../helpers/udp_server')

const FIXTURES = ['simple', 'plugin']

FIXTURES.forEach(fixtureName => {
  test(`Sends timings to --statsd.host|port | ${fixtureName}`, async t => {
    const { host, port, requests, stopServer } = await startUdpServer()
    try {
      await runFixture(t, fixtureName, { flags: { statsd: { host, port } }, snapshot: false })
      const timerRequests = getTimerRequests(requests)
      t.snapshot(timerRequests)
    } finally {
      await stopServer()
    }
  })
})

// Retrieve statsd packets sent to --statsd.host|port, and snapshot them
const getTimerRequests = function(requests) {
  return requests
    .flatMap(flattenRequest)
    .map(normalizeRequest)
    .sort()
    .join('\n')
}

const flattenRequest = function(request) {
  return request.trim().split('\n')
}

const normalizeRequest = function(request) {
  return request.replace(NUMBERS_REGEXP, 0)
}

const NUMBERS_REGEXP = /\d+/g
