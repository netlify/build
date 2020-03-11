const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')
const cpy = require('cpy')

const { runFixtureConfig, FIXTURES_DIR, createRepoDir, removeDir } = require('../helpers/main')

test('--cwd with no config', async t => {
  await runFixtureConfig(t, '', { flags: `--cwd=${FIXTURES_DIR}/empty` })
})

test('--cwd with a relative path config', async t => {
  await runFixtureConfig(t, '', {
    flags: `--cwd=${relative(cwd(), FIXTURES_DIR)} --config=empty/netlify.yml`,
  })
})

test('build.base current directory', async t => {
  await runFixtureConfig(t, 'build_base_cwd')
})

test('--repository-root', async t => {
  await runFixtureConfig(t, '', { flags: `--repository-root=${FIXTURES_DIR}/empty` })
})

test('No .git', async t => {
  const cwd = await createRepoDir({ git: false })
  try {
    await cpy(`${FIXTURES_DIR}/empty/*`, cwd)
    await runFixtureConfig(t, '', { flags: `--cwd=${cwd}` })
  } finally {
    await removeDir(cwd)
  }
})

test('--cwd non-existing', async t => {
  await runFixtureConfig(t, '', { flags: `--cwd=/invalid --repository-root=${FIXTURES_DIR}/empty` })
})

test('--repositoryRoot non-existing', async t => {
  await runFixtureConfig(t, '', { flags: `--repositoryRoot=/invalid` })
})
