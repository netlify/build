import { NetlifyAPI } from '@netlify/api'
import { resolveConfig } from '@netlify/config'
import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

test('api is a NetlifyAPI whose methods are own enumerable properties', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
  const { api } = await resolveConfig(
    new Fixture(import.meta.url, './fixtures/empty')
      .withFlags({ token: 'test', testOpts: { env: true } })
      .getConfigFlags(),
  )

  expect(api).toBeInstanceOf(NetlifyAPI)
  // @netlify/build wraps each method it finds with `Object.entries(api)`.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- `resolveConfig`'s result is untyped until its rewrite
  const methods = Object.entries(api ?? {}).filter(([, value]) => typeof value === 'function')
  expect(methods.map(([name]) => name)).toContain('getSite')
})
