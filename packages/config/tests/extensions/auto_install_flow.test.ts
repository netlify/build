import { Fixture } from '@netlify/testing'
import { beforeEach, expect, test, vi } from 'vitest'

const AUTO_INSTALLABLE_URL = 'https://api.netlifysdk.com/meta/auto-installable'
const INSTALL_URL = 'https://neon-extension.netlify.app/.netlify/functions/handler/on-install'
const INSTALLATIONS_PATH = '/team/account1/integrations/installations/meta/test'

const AUTO_INSTALLABLE = [
  { slug: 'neon', hostSiteUrl: 'https://neon-extension.netlify.app', packages: ['@netlify/neon'] },
]

const SERVER_HANDLERS = [
  { path: '/api/v1/sites/test', response: { id: 'test', name: 'test' } },
  { path: INSTALLATIONS_PATH, response: [] },
  { path: '/site/test/integrations/safe', response: [] },
]

let installCalls: string[]

const interceptFetch = ({ metadataStatus = 200, installStatus = 200 }) => {
  const originalFetch = globalThis.fetch
  vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const url = input instanceof Request ? input.url : String(input)
    if (url === AUTO_INSTALLABLE_URL) {
      return Promise.resolve(Response.json(AUTO_INSTALLABLE, { status: metadataStatus }))
    }
    if (url === INSTALL_URL) {
      installCalls.push(typeof init?.body === 'string' ? init.body : '')
      return Promise.resolve(new Response('install response', { status: installStatus }))
    }
    return originalFetch(input, init)
  })
}

beforeEach(() => {
  installCalls = []
})

const runAutoInstall = async (flags: Record<string, unknown> = {}) => {
  const { output, requests } = await new Fixture(import.meta.url, './fixtures/with_neon_package')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: { auto_install_required_extensions_v2: true },
      ...flags,
    })
    .runConfigServer(SERVER_HANDLERS)
  const installationsFetches = requests.filter(({ url }) => url === INSTALLATIONS_PATH).length
  const { integrations } = JSON.parse(output) as { integrations: unknown[] }
  return { installationsFetches, integrations }
}

test('Extensions are fetched again after a successful install', async () => {
  interceptFetch({ installStatus: 200 })

  const { installationsFetches } = await runAutoInstall()

  expect(installCalls).toEqual([JSON.stringify({ teamId: 'account1' })])
  expect(installationsFetches).toBe(2)
})

test('An install that returns 409 counts as installed', async () => {
  interceptFetch({ installStatus: 409 })

  const { installationsFetches } = await runAutoInstall()

  expect(installCalls).toHaveLength(1)
  expect(installationsFetches).toBe(2)
})

test('Extensions are not fetched again after a failed install', async () => {
  interceptFetch({ installStatus: 500 })

  const { installationsFetches } = await runAutoInstall()

  expect(installCalls).toHaveLength(1)
  expect(installationsFetches).toBe(1)
})

test('Nothing is installed when the auto-installable extensions cannot be fetched', async () => {
  interceptFetch({ metadataStatus: 500 })

  const { installationsFetches } = await runAutoInstall()

  expect(installCalls).toEqual([])
  expect(installationsFetches).toBe(1)
})

test('Nothing is installed without an account ID', async () => {
  interceptFetch({})

  const { integrations } = await runAutoInstall({ accountId: undefined })

  expect(integrations).toEqual([])
  expect(installCalls).toEqual([])
})
