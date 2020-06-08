const test = require('ava')

const { removeDir } = require('../../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Expose some utils', async t => {
  await runFixture(t, 'keys')
})

test('Utils are defined', async t => {
  await runFixture(t, 'defined')
})

test('Can run utils', async t => {
  await removeDir(`${FIXTURES_DIR}/functions/functions`)
  await runFixture(t, 'functions')
  await removeDir(`${FIXTURES_DIR}/functions/functions`)
})

test('Git utils fails if no root', async t => {
  await runFixture(t, 'git_no_root', { copyRoot: { git: false } })
})

test('Git utils does not fail if no root and not used', async t => {
  await runFixture(t, 'keys', { copyRoot: { git: false } })
})
