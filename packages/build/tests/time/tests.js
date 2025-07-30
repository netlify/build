import dns from 'dns'

import { intercept, cleanAll } from '@netlify/nock-udp'
import { Fixture } from '@netlify/testing'
import test from 'ava'
import { spyOn } from 'tinyspy'

let dnsLookupSpy

test.before(() => {
  const origLookup = dns.lookup
  // we have to stub dns lookup as hot-shots is caching dns and therefore calling dns.lookup directly
  dnsLookupSpy = spyOn(dns, 'lookup', (host, options, cb = options) => {
    if (options === cb) {
      options = {}
    }
    if (host.startsWith(`timetest.`)) {
      cb(undefined, host, 4)
    } else {
      origLookup(host, options, cb)
    }
  })
})

test.after(() => {
  dnsLookupSpy.restore()
  cleanAll()
})

test('Does not send plugin timings if no plugins', async (t) => {
  t.snapshot(await getTimerRequestsString(t, './fixtures/simple'))
})

test('Sends timings of Netlify maintained plugins', async (t) => {
  t.snapshot(await getTimerRequestsString(t, './fixtures/system_plugin'))
})

test('Does not send timings of community plugins', async (t) => {
  t.snapshot(await getTimerRequestsString(t, './fixtures/community_plugin'))
})

test('Sends timing for functions bundling', async (t) => {
  t.snapshot(await getTimerRequestsString(t, './fixtures/functions_zisi'))
})

test('Sends timing for edge functions bundling', async (t) => {
  t.snapshot(await getTimerRequestsString(t, './fixtures/edge_functions'))
})

test('Sends distribution metrics', async (t) => {
  const timerRequests = await getAllTimerRequests(t, './fixtures/simple')
  const includesDistributionRequests = timerRequests.some((timerRequest) => timerRequest.includes('|d|'))

  t.true(includesDistributionRequests)
})

test('Allow passing --framework CLI flag', async (t) => {
  const timerRequests = await getAllTimerRequests(t, './fixtures/simple', { framework: 'test' })
  t.true(timerRequests.every((timerRequest) => timerRequest.includes('framework:test')))
})

test('Default --framework CLI flag to nothing', async (t) => {
  const timerRequests = await getAllTimerRequests(t, './fixtures/simple')
  t.true(timerRequests.every((timerRequest) => !timerRequest.includes('framework:')))
})

test('Sends a `bundler: "zisi"` tag when bundler set to zisi', async (t) => {
  const timerRequests = await getAllTimerRequests(t, './fixtures/functions_zisi')
  const functionsBundlingRequest = timerRequests.find((timerRequest) =>
    timerRequest.includes('stage:functions_bundling'),
  )

  t.true(functionsBundlingRequest.includes('bundler:zisi'))
  t.false(functionsBundlingRequest.includes('bundler:zisi,bundler:zisi'))
})

test('Sends a `bundler: "nft"` tag when bundler set to nft', async (t) => {
  const timerRequests = await getAllTimerRequests(t, './fixtures/functions_nft')
  const functionsBundlingRequest = timerRequests.find((timerRequest) =>
    timerRequest.includes('stage:functions_bundling'),
  )

  t.true(functionsBundlingRequest.includes('bundler:nft'))
  t.false(functionsBundlingRequest.includes('bundler:nft,bundler:nft'))
})

test('Sends a `bundler: "esbuild"` tag when at least one function uses the esbuild bundler', async (t) => {
  const timerRequests = await getAllTimerRequests(t, './fixtures/functions_esbuild')
  const functionsBundlingRequest = timerRequests.find((timerRequest) =>
    timerRequest.includes('stage:functions_bundling'),
  )

  t.true(functionsBundlingRequest.includes('bundler:nft,bundler:esbuild'))
})

// Retrieve statsd packets sent to --statsd.host|port, and get their snapshot
const getTimerRequestsString = async function (t, fixtureName, flags) {
  const timerRequests = await getAllTimerRequests(t, fixtureName, flags)
  const timerRequestsString = serializeTimerRequests(timerRequests)
  return timerRequestsString
}

const getAllTimerRequests = async function (t, fixtureName, flags = {}) {
  // Ensure there's no conflict between each test scope
  const host = `timetest.${encodeURI(t.title)}`
  const port = '1234'
  const scope = intercept(`${host}:${port}`, { persist: true, allowUnknown: true })

  // Since we're overriding globals via `nock-udp` our `Fixture` needs to run programmatically. `runBuildBinary` here
  // won't work
  await new Fixture(fixtureName).withFlags({ statsd: { host, port }, ...flags }).runWithBuild()

  const timerRequests = scope.buffers.flatMap(flattenRequest)
  t.true(scope.used)
  scope.clean()
  return timerRequests
}

const flattenRequest = function (request) {
  return request.toString().trim().split('\n')
}

const serializeTimerRequests = function (timerRequests) {
  return timerRequests.map(normalizeRequest).sort().join('\n').trim()
}

const normalizeRequest = function (request) {
  return request.replace(NUMBERS_REGEXP, 0)
}

const NUMBERS_REGEXP = /\d+/g
