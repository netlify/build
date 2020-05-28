const test = require('ava')

const { removeDir } = require('../../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Functions: simple setup', async t => {
  await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  await runFixture(t, 'simple')
})

test('Functions: missing source directory', async t => {
  await runFixture(t, 'missing')
})

test('Functions: must not be a regular file', async t => {
  await runFixture(t, 'regular_file')
})

test('Functions: no functions', async t => {
  await runFixture(t, 'none')
})

test('Functions: default directory', async t => {
  await runFixture(t, 'default')
})
