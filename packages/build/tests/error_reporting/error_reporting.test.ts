import dns from 'dns'

import { intercept, cleanAll } from '@netlify/nock-udp'
import { Fixture } from '@netlify/testing'
import { afterAll, beforeEach, expect, test, vi } from 'vitest'

const origLookup = dns.lookup

beforeEach(() => {
  // we have to stub dns lookup as hot-shots is caching dns and therefore calling dns.lookup directly
  vi.spyOn(dns, 'lookup').mockImplementation((hostname, callback) => {
    if (hostname.startsWith(`errorreportingtest.`)) {
      callback(null, hostname, 4)
    } else {
      origLookup(hostname, callback)
    }
  })
})

afterAll(() => {
  cleanAll()
})

test('Does send tracking on edge functions bundling error', async ({ task }) => {
  expect(await getTrackingRequestsString(task.name, './fixtures/edge_functions')).toMatchSnapshot()
})

test('Does send tracking on functions bundling error', async ({ task }) => {
  expect(await getTrackingRequestsString(task.name, './fixtures/functions_zisi')).toMatchSnapshot()
})

test('Does send tracking on internal plugin error', async ({ task }) => {
  expect(await getTrackingRequestsString(task.name, './fixtures/system_plugin')).toMatchSnapshot()
})

test('Does send tracking on user plugin error', async ({ task }) => {
  expect(await getTrackingRequestsString(task.name, './fixtures/user_plugin', false)).toBe('')
})

// Retrieve statsd packets sent to --statsd.host|port, and get their snapshot
const getTrackingRequestsString = async function (title: string, fixtureName: string, used = true) {
  const timerRequests = await getAllTrackingRequests(title, fixtureName, used)
  const timerRequestsString = serializeTimerRequests(timerRequests)
  return timerRequestsString
}

const getAllTrackingRequests = async function (title: string, fixtureName: string, used: boolean) {
  // Ensure there's no conflict between each test scope
  const host = `errorreportingtest.${encodeURI(title)}`
  const port = '1234'
  const scope = intercept(`${host}:${port}`, { persist: true, allowUnknown: true })

  // Since we're overriding globals via `nock-udp` our `Fixture` needs to run programmatically.
  // `runBuildBinary` here won't work
  await new Fixture(import.meta.url, fixtureName).withFlags({ statsd: { host, port } }).runWithBuild()

  const timerRequests = scope.buffers.flatMap(flattenRequest)
  expect(scope.used).toBe(used)
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
