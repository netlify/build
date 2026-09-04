import dns from 'dns'

import { intercept, cleanAll } from '@netlify/nock-udp'
import { Fixture } from '@netlify/testing'
import { afterAll, assert, beforeEach, expect, test, vi } from 'vitest'

const origLookup = dns.lookup

beforeEach(() => {
  // we have to stub dns lookup as hot-shots is caching dns and therefore calling dns.lookup directly
  vi.spyOn(dns, 'lookup').mockImplementation((hostname, callback) => {
    if (hostname.startsWith(`timetest.`)) {
      callback(null, hostname, 4)
    } else {
      origLookup(hostname, callback)
    }
  })
})

afterAll(() => {
  cleanAll()
})

test('Does not send plugin timings if no plugins', async ({ task }) => {
  expect(await getTimerRequestsString(task.name, './fixtures/simple')).toMatchSnapshot()
})

test('Sends timings of Netlify maintained plugins', async ({ task }) => {
  expect(await getTimerRequestsString(task.name, './fixtures/system_plugin')).toMatchSnapshot()
})

test('Does not send timings of community plugins', async ({ task }) => {
  expect(await getTimerRequestsString(task.name, './fixtures/community_plugin')).toMatchSnapshot()
})

test('Sends timing for functions bundling', async ({ task }) => {
  expect(await getTimerRequestsString(task.name, './fixtures/functions_zisi')).toMatchSnapshot()
})

test('Sends timing for edge functions bundling', async ({ task }) => {
  expect(await getTimerRequestsString(task.name, './fixtures/edge_functions')).toMatchSnapshot()
})

test('Sends distribution metrics', async ({ task }) => {
  const timerRequests = await getAllTimerRequests(task.name, './fixtures/simple')
  const includesDistributionRequests = timerRequests.some((timerRequest) => timerRequest.includes('|d|'))

  expect(includesDistributionRequests).toBe(true)
})

test('Allow passing --framework CLI flag', async ({ task }) => {
  const timerRequests = await getAllTimerRequests(task.name, './fixtures/simple', { framework: 'test' })
  expect(timerRequests.every((timerRequest) => timerRequest.includes('framework:test'))).toBe(true)
})

test('Default --framework CLI flag to nothing', async ({ task }) => {
  const timerRequests = await getAllTimerRequests(task.name, './fixtures/simple')
  expect(timerRequests.every((timerRequest) => !timerRequest.includes('framework:'))).toBe(true)
})

test('Sends a `bundler: "zisi"` tag when bundler set to zisi', async ({ task }) => {
  const timerRequests = await getAllTimerRequests(task.name, './fixtures/functions_zisi')
  const functionsBundlingRequest = timerRequests.find((timerRequest) =>
    timerRequest.includes('stage:functions_bundling'),
  )

  assert.isDefined(functionsBundlingRequest)
  expect(functionsBundlingRequest).toContain('bundler:zisi')
  expect(functionsBundlingRequest).not.toContain('bundler:zisi,bundler:zisi')
})

test('Sends a `bundler: "nft"` tag when bundler set to nft', async ({ task }) => {
  const timerRequests = await getAllTimerRequests(task.name, './fixtures/functions_nft')
  const functionsBundlingRequest = timerRequests.find((timerRequest) =>
    timerRequest.includes('stage:functions_bundling'),
  )

  assert.isDefined(functionsBundlingRequest)
  expect(functionsBundlingRequest).toContain('bundler:nft')
  expect(functionsBundlingRequest).not.toContain('bundler:nft,bundler:nft')
})

test('Sends a `bundler: "esbuild"` tag when at least one function uses the esbuild bundler', async ({ task }) => {
  const timerRequests = await getAllTimerRequests(task.name, './fixtures/functions_esbuild')
  const functionsBundlingRequest = timerRequests.find((timerRequest) =>
    timerRequest.includes('stage:functions_bundling'),
  )

  assert.isDefined(functionsBundlingRequest)
  expect(functionsBundlingRequest).toContain('bundler:nft,bundler:esbuild')
})

test('Sends a `bundler` tag on the `buildbot.build.functions` metric', async ({ task }) => {
  const timerRequests = await getAllTimerRequests(task.name, './fixtures/functions_zisi')
  const functionsMetricRequests = timerRequests.filter((timerRequest) =>
    timerRequest.startsWith('buildbot.build.functions:'),
  )

  expect(functionsMetricRequests.length).toBeGreaterThan(0)
  expect(functionsMetricRequests.every((req) => req.includes('bundler:zisi'))).toBe(true)
})

test('Sends multiple `bundler` tags on `buildbot.build.functions` when multiple bundlers are used', async ({
  task,
}) => {
  const timerRequests = await getAllTimerRequests(task.name, './fixtures/functions_esbuild')
  const functionsMetricRequests = timerRequests.filter((timerRequest) =>
    timerRequest.startsWith('buildbot.build.functions:'),
  )

  expect(functionsMetricRequests.length).toBeGreaterThan(0)
  expect(functionsMetricRequests.every((req) => req.includes('bundler:nft') && req.includes('bundler:esbuild'))).toBe(
    true,
  )
})

// Retrieve statsd packets sent to --statsd.host|port, and get their snapshot
const getTimerRequestsString = async function (title: string, fixtureName: string, flags?: Record<string, unknown>) {
  const timerRequests = await getAllTimerRequests(title, fixtureName, flags)
  const timerRequestsString = serializeTimerRequests(timerRequests)
  return timerRequestsString
}

const getAllTimerRequests = async function (title: string, fixtureName: string, flags: Record<string, unknown> = {}) {
  // Ensure there's no conflict between each test scope
  const host = `timetest.${encodeURI(title)}`
  const port = '1234'
  const scope = intercept(`${host}:${port}`, { persist: true, allowUnknown: true })

  // Since we're overriding globals via `nock-udp` our `Fixture` needs to run programmatically. `runBuildBinary` here
  // won't work
  await new Fixture(import.meta.url, fixtureName).withFlags({ statsd: { host, port }, ...flags }).runWithBuild()

  const timerRequests = scope.buffers.flatMap(flattenRequest)
  expect(scope.used).toBe(true)
  scope.clean()
  return timerRequests
}

const flattenRequest = function (request: Buffer) {
  return request.toString().trim().split('\n')
}

const serializeTimerRequests = function (timerRequests: string[]) {
  return timerRequests.map(normalizeRequest).sort().join('\n').trim()
}

const normalizeRequest = function (request: string) {
  return request.replace(NUMBERS_REGEXP, '0')
}

const NUMBERS_REGEXP = /\d+/g
