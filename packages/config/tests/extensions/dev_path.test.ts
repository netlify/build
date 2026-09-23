import { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { resolveConfig } from '@netlify/config'
import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

type Extension = { slug: string; buildPlugin: { origin: string; packageURL: string } | null; has_build: boolean }
type Result = { integrations: Extension[] }

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

const resolveFixture = async (fixtureName: string, flags: Record<string, unknown>) =>
  (await new Fixture(import.meta.url, `./fixtures/${fixtureName}`)
    .withFlags({ offline: true, ...flags })
    .runWithConfigAsObject()) as Result

test('In dev mode, a dev.path pointing at a directory uses the default build plugin tarball inside it', async () => {
  const { integrations } = await resolveFixture('dev_path', { context: 'dev' })

  expect(integrations.find(({ slug }) => slug === 'dir-extension')).toMatchObject({
    has_build: true,
    buildPlugin: {
      origin: 'local',
      packageURL: pathToFileURL(join(FIXTURES_DIR, 'dev_path/ext/.ntli/site/static/packages/buildhooks.tgz')).href,
    },
  })
})

test('In dev mode, a dev.path pointing at a tarball uses it as the build plugin', async () => {
  const { integrations } = await resolveFixture('dev_path', { context: 'dev' })

  expect(integrations.find(({ slug }) => slug === 'tarball-extension')).toMatchObject({
    has_build: true,
    buildPlugin: { origin: 'local', packageURL: pathToFileURL(join(FIXTURES_DIR, 'dev_path/ext/package.tgz')).href },
  })
})

test('Outside dev mode, extensions from the config file are ignored', async () => {
  const { integrations } = await resolveFixture('dev_path', { context: 'production' })

  expect(integrations).toEqual([])
})

test('A build plugin URL that is not a tarball is a user error', async () => {
  const flags = new Fixture(import.meta.url, './fixtures/dev_path_invalid')
    .withFlags({ offline: true, context: 'dev' })
    .getConfigFlags()

  const result = resolveConfig(flags)
  await expect(result).rejects.toThrow(
    `Extension zip-extension contains unexpected build plugin URL: '${pathToFileURL(join(FIXTURES_DIR, 'dev_path_invalid/extension.zip')).href}'. Build plugin URLs must end in '.tgz'.`,
  )
  await expect(result).rejects.toHaveProperty('customErrorInfo', { type: 'resolveConfig' })
})
