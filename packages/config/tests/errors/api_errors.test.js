import { resolveConfig } from '@netlify/config'
import { Fixture, startServer } from '@netlify/testing'
import { expect, test } from 'vitest'

const CALL_TO_ACTION =
  "Double-check your login status with 'netlify status' or contact support with details of your error."

const API_RESPONSES = {
  site: { path: '/api/v1/sites/test', response: { name: 'test-name' } },
  accounts: { path: '/api/v1/accounts', response: [] },
  extensions: { path: '/site/test/integrations/safe', response: [] },
}

const getRejection = async (promise) => {
  try {
    await promise
  } catch (error) {
    if (error instanceof Error) return error
  }
  throw new Error('Expected the promise to reject with an Error')
}

const resolveWithFailingApiCall = async (failingCall) => {
  const handlers = Object.entries(API_RESPONSES).map(([call, handler]) =>
    call === failingCall ? { path: handler.path, status: 500, response: {} } : handler,
  )
  const { scheme, host, stopServer } = await startServer(handlers)
  try {
    const flags = new Fixture(import.meta.url, '../api/fixtures/empty')
      .withFlags({ token: 'test', siteId: 'test', testOpts: { scheme, host } })
      .getConfigFlags()
    return await getRejection(resolveConfig(flags))
  } finally {
    await stopServer()
  }
}

// netlify-cli retries offline on user errors, and @netlify/build reports them as configuration errors.
const expectUserError = (error) => {
  expect(error).toHaveProperty('customErrorInfo', { type: 'resolveConfig' })
}

test('A failure to fetch the site is a user error', async () => {
  const error = await resolveWithFailingApiCall('site')

  expectUserError(error)
  expect(error.message).toBe(`Failed retrieving site data for site test: Internal Server Error. ${CALL_TO_ACTION}`)
})

test('A failure to fetch the accounts is a user error', async () => {
  const error = await resolveWithFailingApiCall('accounts')

  expectUserError(error)
  expect(error.message).toBe(`Failed retrieving user account: Internal Server Error. ${CALL_TO_ACTION}`)
})

test('A failure to fetch the extensions is a user error', async () => {
  const error = await resolveWithFailingApiCall('extensions')

  expectUserError(error)
  expect(error.message).toBe(
    `Failed retrieving extensions for site test: Unexpected status code 500 from fetching extensions. ${CALL_TO_ACTION}`,
  )
})
