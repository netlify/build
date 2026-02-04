import { Fixture, startServer } from '@netlify/testing'
import test from 'ava'

const SITE_INFO_PATH = '/api/v1/sites/test'
const SITE_INFO_RESPONSE = { id: 'test', name: 'test-site' }
const EXTENSIONS_PATH = '/site/test/integrations/safe'
const CREATE_DATABASE_PATH = '/api/v1/sites/test/database'
const CREATE_DATABASE_BRANCH_PATH = '/api/v1/sites/test/database/branch'
const MAIN_CONNECTION_STRING = 'postgres://main-db.netlify.app:5432/main'
const BRANCH_CONNECTION_STRING = 'postgres://branch-db.netlify.app:5432/branch'
const CREATE_DATABASE_RESPONSE = { connection_string: MAIN_CONNECTION_STRING }
const CREATE_DATABASE_BRANCH_RESPONSE = { connection_string: BRANCH_CONNECTION_STRING }
const FEATURE_FLAGS = { netlify_build_db_setup: true }

const runWithMockServer = async (fixture, { context = 'production' } = {}) => {
  const { scheme, host, requests, stopServer } = await startServer([
    { path: SITE_INFO_PATH, response: SITE_INFO_RESPONSE },
    { path: EXTENSIONS_PATH, response: [] },
    { path: CREATE_DATABASE_PATH, response: CREATE_DATABASE_RESPONSE },
    { path: CREATE_DATABASE_BRANCH_PATH, response: CREATE_DATABASE_BRANCH_RESPONSE },
  ])

  try {
    const output = await fixture
      .withFlags({ siteId: 'test', token: 'test', featureFlags: FEATURE_FLAGS, context, testOpts: { scheme, host } })
      .runWithBuild()

    return { output, requests }
  } finally {
    await stopServer()
  }
}

test('Runs the db_setup core step and makes NETLIFY_DB_URL available to the build command in production context', async (t) => {
  const { output, requests } = await runWithMockServer(new Fixture('./fixtures/with_db_dependency'), {
    context: 'production',
  })

  t.true(output.includes('Netlify DB setup completed'))
  t.true(output.includes(MAIN_CONNECTION_STRING))

  // Should call createSiteDatabase but not createSiteDatabaseBranch for production
  const databaseRequests = requests.filter((r) => r.url === CREATE_DATABASE_PATH)
  const branchRequests = requests.filter((r) => r.url === CREATE_DATABASE_BRANCH_PATH)
  t.is(databaseRequests.length, 1)
  t.is(branchRequests.length, 0)
})

test('Runs the db_setup core step and creates a database branch for non-production context', async (t) => {
  const { output, requests } = await runWithMockServer(
    new Fixture('./fixtures/with_db_dependency').withFlags({ deployId: 'test-deploy-id' }),
    { context: 'deploy-preview' },
  )

  t.true(output.includes('Netlify DB setup completed'))
  t.true(output.includes(BRANCH_CONNECTION_STRING))

  // Should call both createSiteDatabase and createSiteDatabaseBranch for non-production
  const databaseRequests = requests.filter((r) => r.url === CREATE_DATABASE_PATH)
  const branchRequests = requests.filter((r) => r.url === CREATE_DATABASE_BRANCH_PATH)
  t.is(databaseRequests.length, 1)
  t.is(branchRequests.length, 1)

  // Verify the branch request includes the deploy_id
  t.deepEqual(branchRequests[0].body, { deploy_id: 'test-deploy-id' })
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
  const { output } = await runWithMockServer(
    new Fixture('./fixtures/monorepo').withFlags({ packagePath: 'apps/app-1' }),
  )

  t.true(output.includes('Netlify DB setup completed'))
  t.true(output.includes(MAIN_CONNECTION_STRING))
})
