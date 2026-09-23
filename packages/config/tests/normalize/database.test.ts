import { join } from 'path'
import { fileURLToPath } from 'url'

import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

type Result = { config: { database?: { migrations?: { path?: string } } } }

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

const resolveFixture = async (fixtureName: string) =>
  (await new Fixture(import.meta.url, `./fixtures/${fixtureName}`).runWithConfigAsObject()) as Result

test('Assign default database migrations path if database.migrations.path is not defined and the directory exists', async () => {
  const { config } = await resolveFixture('default_database_migrations_not_defined')

  expect(config.database?.migrations?.path).toBe(
    join(FIXTURES_DIR, 'default_database_migrations_not_defined/netlify/database/migrations'),
  )
})

test('Does not assign default database migrations path if database.migrations.path is defined', async () => {
  const { config } = await resolveFixture('default_database_migrations_defined')

  expect(config.database?.migrations?.path).toBe(
    join(FIXTURES_DIR, 'default_database_migrations_defined/db/migrations'),
  )
})

test('Does not assign default database migrations path if the directory does not exist', async () => {
  const { config } = await resolveFixture('empty')

  expect(config.database).toBeUndefined()
})
