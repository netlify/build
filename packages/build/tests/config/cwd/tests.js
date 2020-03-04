const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('--cwd with no config', async t => {
  await runFixture(t, '', { flags: `--cwd ${FIXTURES_DIR}/empty` })
})

test('--cwd with a relative path config', async t => {
  await runFixture(t, '', {
    flags: `--cwd ${relative(cwd(), FIXTURES_DIR)} --config=empty/netlify.yml`,
  })
})

test('build.base current directory', async t => {
  await runFixture(t, 'build_base_cwd')
})

test('no build.base current directory', async t => {
  await runFixture(t, 'build_base_none')
})
