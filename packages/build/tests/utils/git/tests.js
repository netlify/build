const test = require('ava')

const { runFixture } = require('../../helpers/main')

// Runs the git utils against very old commits of @netlify/build so that the
// tests are stable
const env = { CACHED_COMMIT_REF: '6bdf580f', TEST_HEAD: '152867c2' }

test('git-utils defined', async t => {
  await runFixture(t, 'defined', { env })
})

test('git-utils cwd', async t => {
  await runFixture(t, 'defined', { copyRoot: {} })
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
