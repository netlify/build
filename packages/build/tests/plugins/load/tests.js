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

// Need to run `npm install` and `yarn` serially to avoid network errors
test.serial('Install missing plugins with npm locally with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/install_missing_npm_lock/node_modules`)
  await runFixture(t, 'install_missing_npm_lock', { copyRoot: {} })
})

test.serial('Install missing plugins with npm in CI with no lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/install_missing_npm_ci_no_lock/node_modules`)
  await runFixture(t, 'install_missing_npm_ci_no_lock', { copyRoot: {}, env: { NETLIFY: 'true' } })
})

test.serial('Install missing plugins with npm in CI with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/install_missing_npm_ci_lock/node_modules`)
  await runFixture(t, 'install_missing_npm_ci_lock', { copyRoot: {}, env: { NETLIFY: 'true' } })
})

test.serial('Install missing plugins with Yarn locally with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/install_missing_yarn_lock/node_modules`)
  await runFixture(t, 'install_missing_yarn_lock', { copyRoot: {} })
})

test.serial('Install missing plugins with Yarn in CI with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/install_missing_yarn_ci_lock/node_modules`)
  await runFixture(t, 'install_missing_yarn_ci_lock', { copyRoot: {}, env: { NETLIFY: 'true' } })
})

test.serial('Already installed plugins', async t => {
  await runFixture(t, 'installed_already')
})
