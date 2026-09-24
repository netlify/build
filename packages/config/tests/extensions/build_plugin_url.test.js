import { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { resolveConfig } from '@netlify/config'
import { Fixture, startServer } from '@netlify/testing'
import { expect, test } from 'vitest'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('The build plugin URL of an extension from the API is a URL', async () => {
  const { scheme, host, stopServer } = await startServer([
    { path: '/api/v1/sites/test', response: {} },
    { path: '/api/v1/accounts', response: [] },
    {
      path: '/site/test/integrations/safe',
      response: [
        {
          author: '',
          extension_token: '',
          has_build: true,
          name: 'api-extension',
          slug: 'api-extension',
          version: 'https://api-extension.netlify.app',
        },
      ],
    },
  ])
  try {
    const { integrations } = await resolveConfig(
      new Fixture(import.meta.url, './fixtures/dev_path')
        .withFlags({ token: 'test', siteId: 'test', testOpts: { scheme, host } })
        .getConfigFlags(),
    )

    const packageURL = integrations.find(({ slug }) => slug === 'api-extension')?.buildPlugin?.packageURL
    expect(packageURL).toBeInstanceOf(URL)
    expect(packageURL?.href).toBe('https://api-extension.netlify.app/packages/buildhooks.tgz')
  } finally {
    await stopServer()
  }
})

test('The build plugin URL of an extension under development is a URL', async () => {
  const { integrations } = await resolveConfig(
    new Fixture(import.meta.url, './fixtures/dev_path').withFlags({ offline: true, context: 'dev' }).getConfigFlags(),
  )

  const packageURL = integrations.find(({ slug }) => slug === 'tarball-extension')?.buildPlugin?.packageURL
  expect(packageURL).toBeInstanceOf(URL)
  expect(packageURL?.href).toBe(pathToFileURL(join(FIXTURES_DIR, 'dev_path/ext/package.tgz')).href)
})
