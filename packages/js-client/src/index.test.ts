import http from 'http'

import fromString from 'from2-string'
import nock from 'nock'
import { v4 as uuidv4 } from 'uuid'
import { assert, expect, test } from 'vitest'

import { NetlifyAPI } from '../lib/index.js'
import { TextHTTPError, JSONHTTPError } from '../lib/methods/response.js'

const scheme = 'http'
const domain = 'localhost'
const port = 1123
const pathPrefix = '/api/v10'
const host = `${domain}:${port}`
const origin = `${scheme}://${host}`
const testAccessToken = 'testAccessToken'

const AGENT_KEEP_ALIVE_MSECS = 60_000
const AGENT_MAX_SOCKETS = 10
const AGENT_MAX_FREE_SOCKETS = 10
const AGENT_TIMEOUT = 60_000
const agent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: AGENT_KEEP_ALIVE_MSECS,
  maxSockets: AGENT_MAX_SOCKETS,
  maxFreeSockets: AGENT_MAX_FREE_SOCKETS,
  timeout: AGENT_TIMEOUT,
})

const getClient = function (opts: any = {}) {
  return new NetlifyAPI(opts.accessToken, { scheme, host, pathPrefix, ...opts })
}

test('Default options', () => {
  const client = new NetlifyAPI({})
  expect(client.scheme).toBe('https')
  expect(client.host).toBe('api.netlify.com')
  expect(client.pathPrefix).toBe('/api/v1')
  expect(client.accessToken).toBe(null)
  expect(client.agent).toBe(undefined)
  expect(client.globalParams).toEqual({})
  expect(client.defaultHeaders).toEqual({
    'User-agent': 'netlify/js-client',
    accept: 'application/json',
  })
})

test('Can set|get scheme', () => {
  const client = new NetlifyAPI({ scheme })
  expect(client.scheme).toBe(scheme)
})

test('Can set|get host', () => {
  const client = new NetlifyAPI({ host })
  expect(client.host).toBe(host)
})

test('Can set|get pathPrefix', () => {
  const client = new NetlifyAPI({ pathPrefix })
  expect(client.pathPrefix).toBe(pathPrefix)
})

test('Can set|get basePath', () => {
  const client = new NetlifyAPI({ scheme, host, pathPrefix })
  expect(client.basePath).toBe(`${scheme}://${host}${pathPrefix}`)
})

test('Can update basePath', () => {
  const client = new NetlifyAPI({ scheme, host, pathPrefix })

  const newScheme = 'https'
  const newHost = `${domain}:1224`
  const newPathPrefix = '/v2'
  client.scheme = newScheme
  client.host = newHost
  client.pathPrefix = newPathPrefix

  expect(client.basePath).toBe(`${newScheme}://${newHost}${newPathPrefix}`)
})

test('Can set user agent', () => {
  const userAgent = 'test'
  const client = new NetlifyAPI({ userAgent })
  expect(client.defaultHeaders['User-agent']).toBe(userAgent)
})

test('Can set|get globalParams', () => {
  const testGlobalParams = { test: 'test' }
  const client = new NetlifyAPI({ globalParams: testGlobalParams })
  expect(client.globalParams).toEqual(testGlobalParams)
})

test('Can set|get access token', () => {
  const client = getClient()
  client.accessToken = testAccessToken
  expect(client.accessToken).toBe(testAccessToken)
  expect(client.defaultHeaders.Authorization).toBe(`Bearer ${testAccessToken}`)

  client.accessToken = undefined
  expect(client.accessToken).toBe(null)
  expect(client.defaultHeaders.Authorization).toBe(undefined)

  client.accessToken = testAccessToken
  expect(client.accessToken).toBe(testAccessToken)
  expect(client.defaultHeaders.Authorization).toBe(`Bearer ${testAccessToken}`)
})

test('Can specify access token as the first argument', () => {
  const client = new NetlifyAPI(testAccessToken, {})
  expect(client.accessToken).toBe(testAccessToken)
})

test('Can specify access token as an option', () => {
  const client = new NetlifyAPI({ accessToken: testAccessToken })
  expect(client.accessToken).toBe(testAccessToken)
})

test('Can use underscored parameters in path variables', async () => {
  const accountId = uuidv4()
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(200)

  const client = getClient()
  await client.getAccount({ account_id: accountId })

  assert.isTrue(scope.isDone())
})

test('Can use camelcase parameters in path variables', async () => {
  const accountId = uuidv4()
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(200)

  const client = getClient()
  await client.getAccount({ accountId })

  assert.isTrue(scope.isDone())
})

test('Can use global parameters in path variables', async () => {
  const accountId = uuidv4()
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(200)

  const client: any = getClient({ globalParams: { account_id: accountId } })
  await client.getAccount()

  assert.isTrue(scope.isDone())
})

test('Can use underscored parameters in query variables', async () => {
  const clientId = uuidv4()
  const scope = nock(origin).post(`${pathPrefix}/oauth/tickets`).query({ client_id: clientId }).reply(200)

  const client = getClient()
  await client.createTicket({ client_id: clientId })

  assert.isTrue(scope.isDone())
})

test('Can use camelcase parameters in query variables', async () => {
  const clientId = uuidv4()
  const scope = nock(origin).post(`${pathPrefix}/oauth/tickets`).query({ client_id: clientId }).reply(200)

  const client = getClient()
  await client.createTicket({ clientId })

  assert.isTrue(scope.isDone())
})

test('Can use global parameters in query variables', async () => {
  const clientId = uuidv4()
  const scope = nock(origin).post(`${pathPrefix}/oauth/tickets`).query({ client_id: clientId }).reply(200)

  const client: any = getClient({ globalParams: { client_id: clientId } })
  await client.createTicket()

  assert.isTrue(scope.isDone())
})

test('Allow array query parameters', async () => {
  const siteId = uuidv4()
  const scope = nock(origin)
    .get(
      `${pathPrefix}/sites/${siteId}/plugin_runs/latest?packages%5B%5D=%40scope%2Fpackage&packages%5B%5D=%40scope%2Fpackage-two`,
    )
    .reply(200)

  const client: any = getClient()
  await client.getLatestPluginRuns({ site_id: siteId, packages: ['@scope/package', '@scope/package-two'] })

  assert.isTrue(scope.isDone())
})

test('Can specify JSON request body as an object', async () => {
  const body = { test: 'test' }
  const scope = nock(origin)
    .post(`${pathPrefix}/accounts`, body, { 'Content-Type': 'application/json' } as any)
    .reply(200)

  const client: any = getClient()
  await client.createAccount({ body })

  assert.isTrue(scope.isDone())
})

test('Can specify JSON request body as a function', async () => {
  const body = { test: 'test' }
  const scope = nock(origin)
    .post(`${pathPrefix}/accounts`, body, { 'Content-Type': 'application/json' } as any)
    .reply(200)

  const client: any = getClient()
  await client.createAccount({ body: () => body })

  assert.isTrue(scope.isDone())
})

test('Can specify binary request body as a stream', async () => {
  const deployId = uuidv4()
  const path = 'testPath'
  const body = 'test'
  const expectedResponse = { test: 'test' }
  const scope = nock(origin)
    .put(`${pathPrefix}/deploys/${deployId}/files/${path}`, body, { 'Content-Type': 'application/octet-stream' } as any)
    .reply(200, expectedResponse)

  const client = getClient()
  const response = await client.uploadDeployFile({ deploy_id: deployId, path, body: fromString(body) })

  expect(response).toEqual(expectedResponse)
  assert.isTrue(scope.isDone())
})

test('Can specify binary request body as a function', async () => {
  const deployId = uuidv4()
  const path = 'testPath'
  const body = 'test'
  const expectedResponse = { test: 'test' }
  const scope = nock(origin)
    .put(`${pathPrefix}/deploys/${deployId}/files/${path}`, body, { 'Content-Type': 'application/octet-stream' } as any)
    .reply(200, expectedResponse)

  const client = getClient()
  const response = await client.uploadDeployFile({ deploy_id: deployId, path, body: () => fromString(body) })

  expect(response).toEqual(expectedResponse)
  assert.isTrue(scope.isDone())
})

test('Can use global parameters in request body', async () => {
  const body = { test: 'test' }
  const scope = nock(origin).post(`${pathPrefix}/accounts`, body).reply(200)

  const client = getClient({ globalParams: { body } })
  await client.createAccount()

  assert.isTrue(scope.isDone())
})

test('Can set header parameters', async () => {
  const deployId = uuidv4()
  const functionName = 'testFunction'
  const body = 'test'
  const expectedResponse = { test: 'test' }
  const retryCount = 3
  const scope = nock(origin)
    .put(`${pathPrefix}/deploys/${deployId}/functions/${functionName}`, body, {
      'Content-Type': 'application/octet-stream',
    } as any)
    .matchHeader('X-Nf-Retry-Count', retryCount.toString())
    .reply(200, expectedResponse)

  const client: any = getClient()
  const response = await client.uploadDeployFunction({
    deploy_id: deployId,
    name: functionName,
    body: fromString(body),
    xNfRetryCount: retryCount,
  })

  expect(response).toEqual(expectedResponse)
  assert.isTrue(scope.isDone())
})

test('Validates required path parameters', async () => {
  const accountId = uuidv4()
  const scope = nock(origin).put(`${pathPrefix}/accounts/${accountId}`).reply(200)

  const client: any = getClient()
  await expect(client.updateAccount()).rejects.toThrow("Missing required path variable 'account_id'")

  assert.isFalse(scope.isDone())
})

test('Validates required query parameters', async () => {
  const zone_id = uuidv4()
  const scope = nock(origin).post(`${pathPrefix}/dns_zones/${zone_id}/transfer`).reply(200)

  const client: any = getClient()
  await expect(client.transferDnsZone({ zone_id })).rejects.toThrow("Missing required query variable 'account_id'")

  assert.isFalse(scope.isDone())
})

test('Can set request headers', async () => {
  const headerName = 'test'
  const headerValue = 'test'
  const accountId = uuidv4()
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).matchHeader(headerName, headerValue).reply(200)

  const client = getClient()
  await client.getAccount({ account_id: accountId }, { headers: { [headerName]: headerValue } })

  assert.isTrue(scope.isDone())
})

test('Can parse JSON responses', async () => {
  const accountId = uuidv4()
  const expectedResponse = { test: 'test' }
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(200, expectedResponse)

  const client = getClient()
  const response = await client.getAccount({ account_id: accountId })

  expect(response).toEqual(expectedResponse)
  assert.isTrue(scope.isDone())
})

test('Can parse text responses', async () => {
  const accountId = uuidv4()
  const expectedResponse = 'test'
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(200, expectedResponse)

  const client = getClient()
  const response = await client.getAccount({ account_id: accountId })

  expect(response).toEqual(expectedResponse)
  assert.isTrue(scope.isDone())
})

test('Handle error empty responses', async () => {
  const accountId = uuidv4()
  const status = 404
  const expectedResponse = 'test'
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(status, expectedResponse)

  const client = getClient()
  try {
    await client.getAccount({ account_id: accountId })
  } catch (error) {
    expect(error.status).toBe(status)
    expect(error.message).toBe(expectedResponse)
    expect(error.data).toBe(expectedResponse)
    assert.isTrue(error instanceof TextHTTPError)
    assert.isTrue(error.stack !== undefined)
    assert.isTrue(scope.isDone())
  }
})

test('Handle error text responses', async () => {
  const accountId = uuidv4()
  const status = 404
  const expectedResponse = 'test'
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(status, expectedResponse)

  const client = getClient()
  try {
    await client.getAccount({ account_id: accountId })
  } catch (error) {
    expect(error.status).toBe(status)
    expect(error.message).toBe(expectedResponse)
    expect(error.data).toBe(expectedResponse)
    assert.isTrue(error instanceof TextHTTPError)
    assert.isTrue(error.stack !== undefined)
    assert.isTrue(scope.isDone())
  }
})

test('Handle error text responses on JSON endpoints', async () => {
  const accountId = uuidv4()
  const status = 404
  const expectedResponse = 'test'
  const scope = nock(origin)
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(status, expectedResponse, { 'Content-Type': 'application/json' })

  const client = getClient()
  try {
    await client.getAccount({ account_id: accountId })
  } catch (error) {
    expect(error.status).toBe(status)
    expect(error.message).toBe(expectedResponse)
    expect(error.data).toBe(expectedResponse)
    assert.isTrue(error instanceof TextHTTPError)
    assert.isTrue(error.stack !== undefined)
    assert.isTrue(scope.isDone())
  }
})

test('Handle error JSON responses', async () => {
  const accountId = uuidv4()
  const status = 404
  const errorJson = { error: true }
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(status, errorJson)

  const client = getClient()
  try {
    await client.getAccount({ account_id: accountId })
  } catch (error) {
    expect(error.status).toBe(status)
    expect(JSON.parse(error.message)).toEqual({ error: true })
    expect(error.json).toEqual(errorJson)
    assert.isTrue(error instanceof JSONHTTPError)
    assert.isTrue(error.stack !== undefined)
    assert.isTrue(scope.isDone())
  }
})

test('Handle network errors', async () => {
  const accountId = uuidv4()
  const expectedResponse = 'test'
  const url = `${pathPrefix}/accounts/${accountId}`
  const scope = nock(origin).get(url).replyWithError(expectedResponse)

  const client = getClient()
  try {
    await client.getAccount({ account_id: accountId })
  } catch (error) {
    assert.isTrue(error instanceof Error)
    expect(error.name).toBe('FetchError')
    assert.isTrue(error.message.includes(expectedResponse))
    expect(error.url).toBe(`${origin}${url}`)
    expect(error.data.method).toBe('GET')
    assert.isTrue(scope.isDone())
  }
})

test('Can get an access token from a ticket', async () => {
  const ticketId = uuidv4()
  const accessToken = 'test'
  const scope = nock(origin)
    .get(`${pathPrefix}/oauth/tickets/${ticketId}`)
    .reply(200, { authorized: true, id: ticketId })
    .post(`${pathPrefix}/oauth/tickets/${ticketId}/exchange`)
    .reply(200, { access_token: accessToken })

  const client = getClient()
  const timeout = 5e3
  const response = await client.getAccessToken({ id: ticketId, poll: 1, timeout })

  expect(response).toBe(accessToken)
  expect(client.accessToken).toBe(accessToken)
  assert.isTrue(scope.isDone())
})

test('Can poll for access token', async () => {
  const ticketId = uuidv4()
  const accessToken = 'test'
  const scope = nock(origin)
    .get(`${pathPrefix}/oauth/tickets/${ticketId}`)
    .reply(200, {})
    .get(`${pathPrefix}/oauth/tickets/${ticketId}`)
    .reply(200, { authorized: true, id: ticketId })
    .post(`${pathPrefix}/oauth/tickets/${ticketId}/exchange`)
    .reply(200, { access_token: accessToken })

  const client = getClient()
  await client.getAccessToken({ id: ticketId })

  assert.isTrue(scope.isDone())
})

test('Can change access token polling', async () => {
  const ticketId = uuidv4()
  const accessToken = 'test'
  const scope = nock(origin)
    .get(`${pathPrefix}/oauth/tickets/${ticketId}`)
    .reply(200, {})
    .get(`${pathPrefix}/oauth/tickets/${ticketId}`)
    .reply(200, { authorized: true, id: ticketId })
    .post(`${pathPrefix}/oauth/tickets/${ticketId}/exchange`)
    .reply(200, { access_token: accessToken })

  const client = getClient()
  await client.getAccessToken({ id: ticketId }, { poll: 1 })

  assert.isTrue(scope.isDone())
})

test('Can timeout access token polling', async () => {
  const ticketId = uuidv4()
  const accessToken = 'test'
  const scope = nock(origin)
    .get(`${pathPrefix}/oauth/tickets/${ticketId}`)
    .reply(200, {})
    .get(`${pathPrefix}/oauth/tickets/${ticketId}`)
    .reply(200, { authorized: true, id: ticketId })
    .post(`${pathPrefix}/oauth/tickets/${ticketId}/exchange`)
    .reply(200, { access_token: accessToken })

  const client = getClient()
  await expect(client.getAccessToken({ id: ticketId }, { poll: 1, timeout: 1 })).rejects.toThrow()

  assert.isFalse(scope.isDone())
})

test('Does not retry on server errors', async () => {
  const errorMessage = 'Something went zap!'
  const accountId = uuidv4()
  const expectedResponse = { test: 'test' }
  const scope = nock(origin)
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(500, errorMessage)
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(200, expectedResponse)

  const client = getClient()
  try {
    await client.getAccount({ account_id: accountId })
  } catch (error) {
    expect(error.status).toBe(500)
    expect(error.message).toBe(errorMessage)
    assert.isFalse(scope.isDone())
  }
})

test('Retries on server errors for the `getLatestPluginRuns` endpoint', async () => {
  const packages = 'foo'
  const siteId = uuidv4()
  const expectedResponse = { test: 'test' }
  const scope = nock(origin)
    .get(`${pathPrefix}/sites/${siteId}/plugin_runs/latest`)
    .query({ packages })
    .reply(500)
    .get(`${pathPrefix}/sites/${siteId}/plugin_runs/latest`)
    .query({ packages })
    .reply(200, expectedResponse)

  const client: any = getClient()
  const response = await client.getLatestPluginRuns({ site_id: siteId, packages })

  expect(response).toEqual(expectedResponse)
  assert.isTrue(scope.isDone())
})

test('Handles API rate limiting', async () => {
  const accountId = uuidv4()
  const retryAtMs = Date.now() + TEST_RATE_LIMIT_DELAY
  const retryAt = Math.ceil(retryAtMs / SECS_TO_MSECS)
  const expectedResponse = { test: 'test' }
  const scope = nock(origin)
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(429, { retryAt }, { 'X-RateLimit-Reset': retryAt.toString() })
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(200, expectedResponse)

  const client = getClient()
  const response = await client.getAccount({ account_id: accountId })

  assert.isTrue(Date.now() >= retryAtMs)
  expect(response).toEqual(expectedResponse)
  assert.isTrue(scope.isDone())
})

test('Handles API rate limiting when date is in the past', async () => {
  const accountId = uuidv4()
  const expectedResponse = { test: 'test' }
  const retryAt = 0
  const scope = nock(origin)
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(429, { retryAt }, { 'X-RateLimit-Reset': retryAt.toString() })
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(200, expectedResponse)

  const client = getClient()
  await client.getAccount({ account_id: accountId })

  assert.isTrue(scope.isDone())
})

test('Handles API rate limiting when X-RateLimit-Reset is missing', async () => {
  const accountId = uuidv4()
  const expectedResponse = { test: 'test' }
  const retryAt = 'invalid'
  const scope = nock(origin)
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(429, { retryAt })
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(200, expectedResponse)

  const client = getClient()
  await client.getAccount({ account_id: accountId })

  assert.isTrue(scope.isDone())
})

test('Gives up retrying on API rate limiting after a timeout', async () => {
  const accountId = uuidv4()
  const retryAt = Math.ceil(Date.now() / SECS_TO_MSECS)
  const expectedResponse = { test: 'test' }
  const times = 20
  const scope = nock(origin)
    .get(`${pathPrefix}/accounts/${accountId}`)
    .times(times)
    .reply(429, { retryAt }, { 'X-RateLimit-Reset': retryAt.toString() })
    .get(`${pathPrefix}/accounts/${accountId}`)
    .reply(200, expectedResponse)

  const client = getClient()
  try {
    await client.getAccount({ account_id: accountId })
  } catch (error) {
    expect(error.status).toBe(429)
    expect(error.message).toBe(JSON.stringify({ retryAt }))
    assert.isTrue(Number.isInteger(error.json.retryAt))
    assert.isFalse(scope.isDone())
  }
})

const errorCodes = ['ETIMEDOUT', 'ECONNRESET']
errorCodes.forEach((code) => {
  test(`Retries on ${code} connection errors`, async () => {
    const accountId = uuidv4()
    const retryAtMs = Date.now() + TEST_RATE_LIMIT_DELAY
    const expectedResponse = { test: 'test' }
    const scope = nock(origin)
      .get(`${pathPrefix}/accounts/${accountId}`)
      .replyWithError({ code })
      .get(`${pathPrefix}/accounts/${accountId}`)
      .reply(200, expectedResponse)

    const client = getClient()
    const response: any = await client.getAccount({ account_id: accountId })

    assert.isTrue(Date.now() >= retryAtMs)
    expect(response).toEqual(expectedResponse)
    assert.isTrue(scope.isDone())
  })
})

test('Recreates a function body when handling API rate limiting', async () => {
  const deployId = uuidv4()
  const path = 'testPath'
  const body = 'test'
  const retryAtMs = Date.now() + TEST_RATE_LIMIT_DELAY
  const retryAt = Math.ceil(retryAtMs / SECS_TO_MSECS)
  const expectedResponse = { test: 'test' }
  const scope = nock(origin)
    .put(`${pathPrefix}/deploys/${deployId}/files/${path}`, body, { 'Content-Type': 'application/octet-stream' } as any)
    .reply(429, { retryAt }, { 'X-RateLimit-Reset': retryAt.toString() })
    .put(`${pathPrefix}/deploys/${deployId}/files/${path}`, body, { 'Content-Type': 'application/octet-stream' } as any)
    .reply(200, expectedResponse)
  const client = getClient()
  const response = await client.uploadDeployFile({ deploy_id: deployId, path, body: () => fromString(body) })

  assert.isTrue(Date.now() >= retryAtMs)
  expect(response).toEqual(expectedResponse)
  assert.isTrue(scope.isDone())
})

test('Can set (proxy) agent', () => {
  const client = getClient({ accessToken: testAccessToken, agent })
  expect(client.agent).toBe(agent)
})

test('(Proxy) agent is passed as request option', async () => {
  const accountId = uuidv4()
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(200)

  const client = getClient({ accessToken: testAccessToken, agent })
  await client.getAccount({ account_id: accountId })
  expect((scope as any).interceptors[0].req.options.agent).toBe(agent)
})

test('(Proxy) agent is not passed as request option if not set', async () => {
  const accountId = uuidv4()
  const scope = nock(origin).get(`${pathPrefix}/accounts/${accountId}`).reply(200)

  const client = getClient({ accessToken: testAccessToken })
  await client.getAccount({ account_id: accountId })
  assert.isUndefined((scope as any).interceptors[0].req.options.agent)
})

const TEST_RATE_LIMIT_DELAY = 5e3
const SECS_TO_MSECS = 1e3
