import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'

import { resolveConfig } from '@netlify/config'
import { Fixture, type ServerHandler, startServer } from '@netlify/testing'
import { tmpName } from 'tmp-promise'
import { expect, test, vi } from 'vitest'

// Inputs that used to be trusted without any check are now checked, but still used as is, with a warning.

const FIXTURE_DIR = fileURLToPath(new URL('fixtures/base', import.meta.url))

const resolveWithApi = async (handlers: ServerHandler) => {
  const { scheme, host, stopServer } = await startServer(handlers)
  try {
    return await resolveConfig({
      cwd: FIXTURE_DIR,
      repositoryRoot: FIXTURE_DIR,
      token: 'test',
      siteId: 'test',
      buffer: true,
      testOpts: { scheme, host },
    })
  } finally {
    await stopServer()
  }
}

const SITE_EXTENSIONS = { path: '/site/test/integrations/safe', response: [] }

test('Unexpected site information from the API is used as is, with a warning', async () => {
  const { siteInfo, logs } = await resolveWithApi([
    { path: '/api/v1/sites/test', response: { name: 42 } },
    { path: '/api/v1/accounts', response: [] },
    SITE_EXTENSIONS,
  ])

  expect(siteInfo.name).toBe(42)
  expect(logs?.stderr.join('\n')).toContain('Unexpected site information from the Netlify API, used as is')
})

test('Unexpected accounts from the API are used as is, with a warning', async () => {
  const { accounts, logs } = await resolveWithApi([
    { path: '/api/v1/sites/test', response: {} },
    { path: '/api/v1/accounts', response: [{ name: 'without a slug' }] },
    SITE_EXTENSIONS,
  ])

  expect(accounts).toEqual([{ name: 'without a slug' }])
  expect(logs?.stderr.join('\n')).toContain('Unexpected accounts from the Netlify API, used as is')
})

test('An unexpected cached config is used as is, with a warning', async () => {
  const cachedConfigPath = await tmpName()
  await writeFile(cachedConfigPath, JSON.stringify({ env: {}, custom: 'value' }))
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  const result = await resolveConfig({ cachedConfigPath })

  expect(result).toMatchObject({ env: {}, custom: 'value' })
  expect(warn.mock.calls.flat().join('\n')).toContain('Unexpected cached config, used as is')
})

test('An inlineConfig that is not an object is spread, as it always has been, with a warning', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    // Not a string, since yargs strips the quotes around a flag's value.
    .withFlags({ inlineConfig: JSON.stringify(['a']) })
    .runConfigBinary()

  expect(output).toContain('Unexpected inlineConfig option, which should be an object, spread into one')
  expect(output).toContain('"0": "a"')
})

test('Unexpected configMutations are used as is, with a warning', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({ configMutations: [{ keys: ['build', 'command'], value: 'test' }] })
    .runWithConfig()

  expect(output).toContain('Unexpected configMutations option, used as is')
})
