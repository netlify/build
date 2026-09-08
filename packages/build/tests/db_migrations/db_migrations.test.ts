import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

const FEATURE_FLAGS = { netlify_build_db_setup: true }

test('Copies valid migrations to internal directory', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/valid_migrations').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  expect(existsSync(join(internalDir, '1700000000_create-users/migration.sql'))).toBe(true)
  expect(existsSync(join(internalDir, '1700000001_add-posts/migration.sql'))).toBe(true)
})

test('Copies migrations from a custom path', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/custom_path').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  expect(existsSync(join(internalDir, '1700000000_create-users/migration.sql'))).toBe(true)
})

test('Silently skips directories with invalid names', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/invalid_dir_name').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  expect(existsSync(join(internalDir, 'bad-name/migration.sql'))).toBe(false)
})

test('Fails build for missing migration.sql', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/missing_sql_file').withCopyRoot({ git: false })

  const { success, logs } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(false)

  const output = logs?.stdout.join('\n')
  expect(output).toContain('migration.sql')
  expect(output).toContain('missing')
})

test('Skips step when migrations directory does not exist', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/no_migrations_dir').withCopyRoot({ git: false })

  const { success, logs } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  const output = logs?.stdout.join('\n')
  expect(output).not.toContain('Netlify Database migrations')
})

test('Skips step when feature flag is off', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/valid_migrations').withCopyRoot({ git: false })

  const { success, logs } = await fixture.withFlags({ cwd: fixture.repositoryRoot }).runBuildProgrammatic()

  expect(success).toBe(true)

  const output = logs?.stdout.join('\n')
  expect(output).not.toContain('Netlify Database migrations')
})

test('Copies loose .sql files wrapped in subdirectory format', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/loose_sql_files').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  expect(existsSync(join(internalDir, '001_create-users/migration.sql'))).toBe(true)
  expect(existsSync(join(internalDir, '002_add-posts/migration.sql'))).toBe(true)
})

test('Copies mixed migrations (dirs and loose files) to internal directory', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/mixed_migrations').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  expect(existsSync(join(internalDir, '1700000000_create-users/migration.sql'))).toBe(true)
  expect(existsSync(join(internalDir, '1700000001_add-posts/migration.sql'))).toBe(true)
})

test('Fails build for duplicate migration numbers', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/duplicate_migration_number').withCopyRoot({
    git: false,
  })

  const { success, logs } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(false)

  const output = logs?.stdout.join('\n')
  expect(output).toContain('Duplicate migration number')
})

test('Handles Drizzle Kit migration structure (loose SQL + meta directory)', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/drizzle_kit').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')

  // The loose .sql file should be wrapped into subdirectory format
  const migrationPath = join(internalDir, '0000_high_yellow_claw/migration.sql')
  expect(existsSync(migrationPath)).toBe(true)

  // Verify the content was copied correctly
  const content = readFileSync(migrationPath, 'utf-8')
  expect(content).toContain('CREATE TABLE "users"')

  // The meta directory should not be copied (it doesn't match the migration pattern)
  expect(existsSync(join(internalDir, 'meta/migration.sql'))).toBe(false)
})
