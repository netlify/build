import { promises as fs } from 'fs'
import path from 'path'

import test, { ExecutionContext } from 'ava'

import { APICache } from '../lib/index.js'

const dateNow = Date.now
const globalFetch = globalThis.fetch

test.afterEach(() => {
  Date.now = dateNow
  globalThis.fetch = globalFetch
})

const getMockFetch = (t: ExecutionContext, mocks: Record<string, () => Response>) => {
  const calls: Record<string, number> = {}

  const mockFetch = async (input: URL | RequestInfo) => {
    for (const url in mocks) {
      if (input.toString() === url) {
        calls[url] = calls[url] ?? 0
        calls[url]++

        return mocks[url]()
      }
    }

    t.fail(`Unexpected fetch call: ${input}`)

    return new Response(null, { status: 400 })
  }

  return { calls, mockFetch }
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

test.serial('Returns response from cache if within TTL', async (t) => {
  const mockEndpoint = 'https://api.netlify/endpoint'
  const mockResponse = { messages: ['Hello', 'Goodbye'] }
  const { calls, mockFetch } = getMockFetch(t, {
    [mockEndpoint]: () => Response.json(mockResponse),
  })

  globalThis.fetch = mockFetch

  const cache = new APICache({
    ttl: 30,
    swr: 30,
  })

  const res1 = await cache.get(mockEndpoint, 'get', {})
  t.deepEqual(res1?.body, mockResponse)
  t.deepEqual(res1?.headers, { 'content-type': 'application/json' })

  const now = Date.now()

  const future = now + 10
  Date.now = () => future

  const res2 = await cache.get(mockEndpoint, 'get', {})
  t.deepEqual(res2?.body, mockResponse)
  t.deepEqual(res2?.headers, { 'content-type': 'application/json' })

  t.is(calls[mockEndpoint], 1)
})

test.serial('Returns response from cache if outside of TTL but within SWR', async (t) => {
  const mockEndpoint = 'https://api.netlify/endpoint'
  const mockResponse = { messages: ['Hello', 'Goodbye'] }
  const { calls, mockFetch } = getMockFetch(t, {
    [mockEndpoint]: () => Response.json(mockResponse),
  })

  globalThis.fetch = mockFetch

  const cache = new APICache({
    ttl: 30,
    swr: 60,
  })

  const res1 = await cache.get(mockEndpoint, 'get', {})
  t.deepEqual(res1?.body, mockResponse)
  t.deepEqual(res1?.headers, { 'content-type': 'application/json' })

  const now = Date.now()

  const future = now + 45
  Date.now = () => future

  const res2 = await cache.get(mockEndpoint, 'get', {})
  t.deepEqual(res2?.body, mockResponse)
  t.deepEqual(res2?.headers, { 'content-type': 'application/json' })

  t.is(calls[mockEndpoint], 1)

  await sleep(10)

  t.is(calls[mockEndpoint], 2)

  const cacheKey = cache.getCacheKey(mockEndpoint, 'get', {})
  t.is(cache.entries[cacheKey].timestamp, future)
})

test.serial('Returns fresh response if outside of TTL and SWR', async (t) => {
  const mockEndpoint = 'https://api.netlify/endpoint'
  const mockResponse = { messages: ['Hello', 'Goodbye'] }
  const { calls, mockFetch } = getMockFetch(t, {
    [mockEndpoint]: () => Response.json(mockResponse),
  })

  globalThis.fetch = mockFetch

  const cache = new APICache({
    ttl: 30,
    swr: 60,
  })

  const res1 = await cache.get(mockEndpoint, 'get', {})
  t.deepEqual(res1?.body, mockResponse)
  t.deepEqual(res1?.headers, { 'content-type': 'application/json' })

  const now = Date.now()

  const future = now + 90
  Date.now = () => future

  const res2 = await cache.get(mockEndpoint, 'get', {})
  t.deepEqual(res2?.body, mockResponse)
  t.deepEqual(res2?.headers, { 'content-type': 'application/json' })

  t.is(calls[mockEndpoint], 2)
})

test.serial('Uses disk fallback', async (t) => {
  const mockEndpoint = 'https://api.netlify/endpoint'
  const mockResponse = { messages: ['Hello', 'Goodbye'] }
  const { calls, mockFetch } = getMockFetch(t, {
    [mockEndpoint]: () => Response.json(mockResponse),
  })

  globalThis.fetch = mockFetch

  const fsPath = await fs.mkdtemp('netlify-js-client-test')
  const cache = new APICache({
    fsPath,
    ttl: 30,
    swr: 60,
  })

  t.teardown(async () => {
    await fs.rm(fsPath, { recursive: true })
  })

  const now = Date.now()
  const cacheKey = cache.getCacheKey(mockEndpoint, 'get', {})
  const filePath = path.join(fsPath, cacheKey)
  const file = {
    body: mockResponse,
    headers: {
      'content-type': 'application/json',
    },
    timestamp: now - 20,
    type: 'json',
  }

  await fs.writeFile(filePath, JSON.stringify(file))

  const res1 = await cache.get(mockEndpoint, 'get', {})
  t.deepEqual(res1?.body, mockResponse)
  t.deepEqual(res1?.headers, { 'content-type': 'application/json' })

  t.falsy(calls[mockEndpoint])

  const future = now + 20
  Date.now = () => future

  const res2 = await cache.get(mockEndpoint, 'get', {})
  t.deepEqual(res2?.body, mockResponse)
  t.deepEqual(res2?.headers, { 'content-type': 'application/json' })

  t.falsy(calls[mockEndpoint])

  await sleep(10)

  t.is(calls[mockEndpoint], 1)

  const newFile = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(newFile)

  t.deepEqual(data.body, mockResponse)
  t.deepEqual(data.headers, { 'content-type': 'application/json' })
  t.is(data.timestamp, future)
})
