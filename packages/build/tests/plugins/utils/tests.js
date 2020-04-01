const test = require('ava')

const { removeDir } = require('../../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('utils-load none', async t => {
  await runFixture(t, 'none')
})

test('utils-load sync function', async t => {
  await runFixture(t, 'function_sync')
})

test('utils-load async function', async t => {
  await runFixture(t, 'function_async')
})

test('utils-load error', async t => {
  await runFixture(t, 'error', { env: { CACHED_COMMIT_REF: 'aaaaaaaa' } })
})

test('utils functions', async t => {
  await removeDir(`${FIXTURES_DIR}/functions/functions`)
  await runFixture(t, 'functions')
  await removeDir(`${FIXTURES_DIR}/functions/functions`)
})

test('utils git with no root', async t => {
  await runFixture(t, 'git_no_root', { copyRoot: { git: false } })
})

test('utils git with no root delayed error', async t => {
  await runFixture(t, 'git_no_root_delayed', { copyRoot: { git: false } })
})
