import { existsSync } from 'fs'
import { join } from 'path'

import { Fixture } from '@netlify/testing'
import test from 'ava'

const FEATURE_FLAGS = { netlify_build_db_setup: true }

test('Copies valid migrations to internal directory', async (t) => {
  const fixture = await new Fixture('./fixtures/valid_migrations').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS }).runBuildProgrammatic()

  t.true(success)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  t.true(existsSync(join(internalDir, '1700000000_create-users/migration.sql')))
  t.true(existsSync(join(internalDir, '1700000001_add-posts/migration.sql')))

  const output = stdout.join('\n')
  t.true(output.includes('DB Migrations copy'))
})

test('Copies migrations from a custom path', async (t) => {
  const fixture = await new Fixture('./fixtures/custom_path').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS }).runBuildProgrammatic()

  t.true(success)

  const internalDir = join(fixture.repositoryRoot, '.netlify/internal/db/migrations')
  t.true(existsSync(join(internalDir, '1700000000_create-users/migration.sql')))

  const output = stdout.join('\n')
  t.true(output.includes('DB Migrations copy'))
})

test('Fails build for invalid directory name', async (t) => {
  const fixture = await new Fixture('./fixtures/invalid_dir_name').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS }).runBuildProgrammatic()

  t.false(success)

  const output = stdout.join('\n')
  t.true(output.includes('bad-name'))
  t.true(output.includes('does not match'))
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
  t.false(output.includes('DB Migrations copy'))
})

test('Skips step when feature flag is off', async (t) => {
  const fixture = await new Fixture('./fixtures/valid_migrations').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot }).runBuildProgrammatic()

  t.true(success)

  const output = stdout.join('\n')
  t.false(output.includes('DB Migrations copy'))
})
