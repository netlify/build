import { Fixture } from '@netlify/testing'
import { expect, test, vi } from 'vitest'

// `mode: 'buildbot'` skips every Netlify API call, so the only request made is the one to the
// extension API, which goes through the global `fetch`.
const resolveExtensionRequestUrls = async (flags: Record<string, unknown>) => {
  const urls: string[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    urls.push(input instanceof Request ? input.url : String(input))
    return Promise.resolve(Response.json([]))
  })

  await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({ siteId: 'test', token: 'test', mode: 'buildbot', ...flags })
    .runWithConfig()

  return urls
}

test('The staging extension API is used when the API host is the staging API', async () => {
  const urls = await resolveExtensionRequestUrls({ accountId: 'account1', host: 'api-staging.netlify.com' })

  expect(urls).toEqual(['https://api-staging.netlifysdk.com/team/account1/integrations/installations/meta/test'])
})

test('The production extension API is used when the API host is the production API', async () => {
  const urls = await resolveExtensionRequestUrls({ accountId: 'account1', host: 'api.netlify.com' })

  expect(urls).toEqual(['https://api.netlifysdk.com/team/account1/integrations/installations/meta/test'])
})

test('The production extension API is used when the API host is any other host', async () => {
  const urls = await resolveExtensionRequestUrls({ accountId: 'account1', host: 'api.example.com' })

  expect(urls).toEqual(['https://api.netlifysdk.com/team/account1/integrations/installations/meta/test'])
})

test('The production extension API is used when no API host is given', async () => {
  const urls = await resolveExtensionRequestUrls({ accountId: 'account1' })

  expect(urls).toEqual(['https://api.netlifysdk.com/team/account1/integrations/installations/meta/test'])
})

test('The site-level extension endpoint is used when no account ID is given', async () => {
  const urls = await resolveExtensionRequestUrls({})

  expect(urls).toEqual(['https://api.netlifysdk.com/site/test/integrations/safe'])
})

test('The extension API is not called when offline', async () => {
  const urls = await resolveExtensionRequestUrls({ accountId: 'account1', offline: true })

  expect(urls).toEqual([])
})
