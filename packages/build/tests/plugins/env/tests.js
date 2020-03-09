const { platform } = require('process')

const test = require('ava')
const cpy = require('cpy')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { createRepoDir, removeDir } = require('../../helpers/dir')

// Windows environment variables work differently
if (platform !== 'win32') {
  test('Environment variable lifecycle commands', async t => {
    await runFixture(t, 'lifecycle')
  })
}

test('Environment variable GATSBY_TELEMETRY_DISABLED', async t => {
  await runFixture(t, 'gatsby_telemetry')
})

test('Environment variable NEXT_TELEMETRY_DISABLED', async t => {
  await runFixture(t, 'next_telemetry')
})

test('Environment variable NETLIFY local', async t => {
  await runFixture(t, 'netlify')
})

test('Environment variable NETLIFY CI', async t => {
  await runFixture(t, 'netlify', { env: { NETLIFY: 'true' } })
})

test('Environment variable LANG', async t => {
  await runFixture(t, 'lang')
})

test('Environment variable LANGUAGE', async t => {
  await runFixture(t, 'language')
})

test('Environment variable LC_ALL', async t => {
  await runFixture(t, 'lc_all')
})

test('Environment variable CONTEXT', async t => {
  await runFixture(t, 'context')
})

test('Environment variable git', async t => {
  await runFixture(t, 'git')
})

test('Environment variable git with --branch', async t => {
  await runFixture(t, 'git_branch', { flags: '--branch=test' })
})

test('Environment variable git no repository', async t => {
  const cwd = await createRepoDir({ git: false })
  try {
    await cpy(`${FIXTURES_DIR}/git/*`, cwd)
    await runFixture(t, 'git', { repositoryRoot: cwd })
  } finally {
    await removeDir(cwd)
  }
})

const BUILD_SITE_INFO = JSON.stringify({ url: 'test', build_settings: { repo_url: 'test' } })
test('Environment variable siteInfo success', async t => {
  await runFixture(t, 'site_info', {
    flags: '--token=test --site-id=test',
    env: { BUILD_SITE_INFO },
  })
})

test('Environment variable siteInfo API error', async t => {
  await runFixture(t, 'site_info', {
    flags: '--token=test --site-id=test',
    env: { BUILD_SITE_INFO: 'invalid' },
  })
})

test('Environment variable siteInfo no token', async t => {
  await runFixture(t, 'site_info', {
    flags: '--site-id=test',
    env: { BUILD_SITE_INFO },
  })
})

test('Environment variable siteInfo no siteId', async t => {
  await runFixture(t, 'site_info', {
    flags: '--token=test',
    env: { BUILD_SITE_INFO },
  })
})

test('Environment variable siteInfo CI', async t => {
  await runFixture(t, 'site_info', {
    flags: '--token=test --site-id=test',
    env: { BUILD_SITE_INFO, NETLIFY: 'true' },
  })
})

test('build.environment', async t => {
  await runFixture(t, 'build')
})

test('build.environment readonly', async t => {
  await runFixture(t, 'build_readonly')
})
