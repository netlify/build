import { Fixture, startServer } from '@netlify/testing'
import test from 'ava'

const SITE_INFO_PATH = '/api/v1/sites/test'
const SITE_INFO_RESPONSE = { id: 'test', name: 'test-site' }
const EXTENSIONS_PATH = '/site/test/integrations/safe'
const FEATURE_FLAGS = { netlify_build_db_setup: true }

const runWithMockServer = async (fixture) => {
  const { scheme, host, stopServer } = await startServer([
    { path: SITE_INFO_PATH, response: SITE_INFO_RESPONSE },
    { path: EXTENSIONS_PATH, response: [] },
  ])

  try {
    const output = await fixture
      .withFlags({ siteId: 'test', token: 'test', featureFlags: FEATURE_FLAGS, testOpts: { scheme, host } })
      .runWithBuild()

    return output
  } finally {
    await stopServer()
  }
}

test('Runs the db_setup core step and makes NETLIFY_DB_URL available to the build command', async (t) => {
  const output = await runWithMockServer(new Fixture('./fixtures/with_db_dependency'))

  t.true(output.includes('Netlify DB setup completed'))
  t.true(output.includes('foobar'))
})

test('Does not run the db_setup core step when @netlify/db is not in dependencies', async (t) => {
  const fixture = await new Fixture('./fixtures/without_db_dependency').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot, featureFlags: FEATURE_FLAGS }).runBuildProgrammatic()

  t.true(success)
  t.false(stdout.join('\n').includes('Netlify DB setup completed'))
})

test('Does not run the db_setup core step when the feature flag is off', async (t) => {
  const fixture = await new Fixture('./fixtures/with_db_dependency').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ cwd: fixture.repositoryRoot }).runBuildProgrammatic()

  t.true(success)
  t.false(stdout.join('\n').includes('Netlify DB setup completed'))
})

test('monorepo > Runs the db_setup core step when @netlify/db is in workspace devDependencies', async (t) => {
  const output = await runWithMockServer(new Fixture('./fixtures/monorepo').withFlags({ packagePath: 'apps/app-1' }))

  t.true(output.includes('Netlify DB setup completed'))
  t.true(output.includes('foobar'))
})
