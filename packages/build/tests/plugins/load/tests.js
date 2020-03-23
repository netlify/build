const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { removeDir } = require('../../helpers/dir')

test('Local plugins', async t => {
  await runFixture(t, 'local')
})

test('Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('Resolution is relative to the config file', async t => {
  await runFixture(t, 'basedir', { flags: `--config=${FIXTURES_DIR}/basedir/base/netlify.yml` })
})

test('Non-existing plugins', async t => {
  await runFixture(t, 'non_existing')
})

test('Install missing plugins', async t => {
  await removeDir(`${FIXTURES_DIR}/install_missing/node_modules`)
  await runFixture(t, 'install_missing', { copyRoot: {} })
})

test('Already installed plugins', async t => {
  await runFixture(t, 'installed_already')
})
