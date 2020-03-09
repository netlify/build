const test = require('ava')
const cpy = require('cpy')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { createRepoDir, removeDir } = require('../../helpers/dir')

// Runs the git utils against very old commits of @netlify/build so that the
// tests are stable
const env = { CACHED_COMMIT_REF: '6bdf580f', TEST_HEAD: '152867c2' }

test('git-utils defined', async t => {
  await runFixture(t, 'defined', { env })
})

test('git-utils cwd', async t => {
  const tmpDir = await createRepoDir()
  try {
    await cpy('**', tmpDir, { cwd: `${FIXTURES_DIR}/defined`, parents: true })
    await runFixture(t, 'defined', { repositoryRoot: tmpDir })
  } finally {
    await removeDir(tmpDir)
  }
})

test('git-utils linesOfCode', async t => {
  await runFixture(t, 'lines', { env })
})

test('git-utils commits', async t => {
  await runFixture(t, 'commits', { env })
})

test('git-utils diff', async t => {
  await runFixture(t, 'diff', { env })
})

test('git-utils fileMatch', async t => {
  await runFixture(t, 'file_match', { env })
})

test('git-utils same commit', async t => {
  await runFixture(t, 'full', {
    env: { CACHED_COMMIT_REF: env.TEST_HEAD, TEST_HEAD: env.TEST_HEAD },
  })
})

test('git-utils unknown commit', async t => {
  await runFixture(t, 'full', {
    env: { CACHED_COMMIT_REF: 'aaaaaaaa', TEST_HEAD: 'aaaaaaaa' },
  })
})

test('git-utils delayed error', async t => {
  await runFixture(t, 'delayed', {
    env: { CACHED_COMMIT_REF: 'aaaaaaaa', TEST_HEAD: 'aaaaaaaa' },
  })
})
