import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

import { Fixture } from '@netlify/testing'
import test from 'ava'

const FEATURE_FLAGS = { netlify_build_db_setup: true }

test('Copies valid migrations to internal directory', async (t) => {
  const fixture = await new Fixture('./fixtures/valid_migrations').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  t.true(success)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  t.true(existsSync(join(internalDir, '1700000000_create-users/migration.sql')))
  t.true(existsSync(join(internalDir, '1700000001_add-posts/migration.sql')))
})

test('Copies migrations from a custom path', async (t) => {
  const fixture = await new Fixture('./fixtures/custom_path').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  t.true(success)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  t.true(existsSync(join(internalDir, '1700000000_create-users/migration.sql')))
})

test('Silently skips directories with invalid names', async (t) => {
  const fixture = await new Fixture('./fixtures/invalid_dir_name').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  t.true(success)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  t.false(existsSync(join(internalDir, 'bad-name/migration.sql')))
})

test('Fails build for missing migration.sql', async (t) => {
  const fixture = await new Fixture('./fixtures/missing_sql_file').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS }).runBuildProgrammatic()

  t.false(success)

  const output = stdout.join('\n')
  t.true(output.includes('migration.sql'))
  t.true(output.includes('missing'))
})

test('Skips step when migrations directory does not exist', async (t) => {
  const fixture = await new Fixture('./fixtures/no_migrations_dir').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS }).runBuildProgrammatic()

  t.true(success)

  const output = stdout.join('\n')
  t.false(output.includes('Netlify DB migrations'))
})

test('Skips step when feature flag is off', async (t) => {
  const fixture = await new Fixture('./fixtures/valid_migrations').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot }).runBuildProgrammatic()

  t.true(success)

  const output = stdout.join('\n')
  t.false(output.includes('Netlify DB migrations'))
})

test('Copies loose .sql files wrapped in subdirectory format', async (t) => {
  const fixture = await new Fixture('./fixtures/loose_sql_files').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  t.true(success)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  t.true(existsSync(join(internalDir, '001_create-users/migration.sql')))
  t.true(existsSync(join(internalDir, '002_add-posts/migration.sql')))
})

test('Copies mixed migrations (dirs and loose files) to internal directory', async (t) => {
  const fixture = await new Fixture('./fixtures/mixed_migrations').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  t.true(success)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  t.true(existsSync(join(internalDir, '1700000000_create-users/migration.sql')))
  t.true(existsSync(join(internalDir, '1700000001_add-posts/migration.sql')))
})

test('Handles Drizzle Kit migration structure (loose SQL + meta directory)', async (t) => {
  const fixture = await new Fixture('./fixtures/drizzle_kit').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS })
    .runBuildProgrammatic()

  t.true(success)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')

  // The loose .sql file should be wrapped into subdirectory format
  const migrationPath = join(internalDir, '0000_high_yellow_claw/migration.sql')
  t.true(existsSync(migrationPath))

  // Verify the content was copied correctly
  const content = readFileSync(migrationPath, 'utf-8')
  t.true(content.includes('CREATE TABLE "users"'))

  // The meta directory should not be copied (it doesn't match the migration pattern)
  t.false(existsSync(join(internalDir, 'meta/migration.sql')))
})
