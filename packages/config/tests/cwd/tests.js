const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('--cwd with no config', async t => {
  await runFixture(t, '', { flags: `--cwd=${FIXTURES_DIR}/empty` })
})

test('--cwd with a relative path config', async t => {
  await runFixture(t, '', {
    flags: `--cwd=${relative(cwd(), FIXTURES_DIR)} --config=empty/netlify.yml`,
  })
})

test('build.base current directory', async t => {
  await runFixture(t, 'build_base_cwd')
})

test('--repository-root', async t => {
  await runFixture(t, '', { flags: `--repository-root=${FIXTURES_DIR}/empty` })
})

test('No .git', async t => {
  await runFixture(t, 'empty', { copyRoot: { cwd: true, git: false } })
})

test('--cwd non-existing', async t => {
  await runFixture(t, '', { flags: `--cwd=/invalid --repository-root=${FIXTURES_DIR}/empty` })
})

test('--repositoryRoot non-existing', async t => {
  await runFixture(t, '', { flags: `--repositoryRoot=/invalid` })
})
