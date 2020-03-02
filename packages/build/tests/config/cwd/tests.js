const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('--cwd with no config', async t => {
  await runFixture(t, '', { config: false, flags: `--cwd ${FIXTURES_DIR}/empty` })
})

test('--cwd with a relative path config', async t => {
  await runFixture(t, '', { config: 'empty/netlify.yml', flags: `--cwd ${relative(cwd(), FIXTURES_DIR)}` })
})
