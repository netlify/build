const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { removeDir } = require('../../helpers/dir')

test('Local plugins', async t => {
  await runFixture(t, 'local')
})

test('Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('Missing plugins', async t => {
  await runFixture(t, 'missing')
})

test('Install missing plugins', async t => {
  await removeDir(`${FIXTURES_DIR}/install_missing/node_modules`)
  await runFixture(t, 'install_missing')
  await removeDir(`${FIXTURES_DIR}/install_missing/node_modules`)
})
