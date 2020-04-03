const test = require('ava')

const { removeDir } = require('../../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

// Need to run `npm install` and `yarn` serially to avoid network errors
test.serial('Install missing plugins with npm locally with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/npm_lock/node_modules`)
  await runFixture(t, 'npm_lock', { copyRoot: {} })
})

test.serial('Install missing plugins with npm in CI with no lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/npm_ci_no_lock/node_modules`)
  await runFixture(t, 'npm_ci_no_lock', { copyRoot: {}, env: { NETLIFY: 'true' } })
})

test.serial('Install missing plugins with npm in CI with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/npm_ci_lock/node_modules`)
  await runFixture(t, 'npm_ci_lock', { copyRoot: {}, env: { NETLIFY: 'true' } })
})

test.serial('Install missing plugins with Yarn locally with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn_lock/node_modules`)
  await runFixture(t, 'yarn_lock', { copyRoot: {} })
})

test.serial('Install missing plugins with Yarn in CI with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn_ci_lock/node_modules`)
  await runFixture(t, 'yarn_ci_lock', { copyRoot: {}, env: { NETLIFY: 'true' } })
})

test.serial('Install missing plugins with Yarn locally with lock file and workspaces', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn_lock_workspaces/node_modules`)
  await runFixture(t, 'yarn_lock_workspaces', { copyRoot: {} })
})

test.serial('Already installed plugins', async t => {
  await runFixture(t, 'installed_already')
})
