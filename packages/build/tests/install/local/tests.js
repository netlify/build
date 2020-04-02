const test = require('ava')
const del = require('del')
const pathExists = require('path-exists')

const { removeDir } = require('../../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

// Need to run `npm install` and `yarn` serially to avoid network errors
test.serial('Install local plugin dependencies: with npm locally with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/npm_lock/plugin/node_modules`)
  await runFixture(t, 'npm_lock')
  t.true(await pathExists(`${FIXTURES_DIR}/npm_lock/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/npm_lock/plugin/node_modules`)
})

test.serial('Install local plugin dependencies: with npm in CI with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/npm_ci_lock/plugin/node_modules`)
  await runFixture(t, 'npm_ci_lock', { env: { NETLIFY: 'true' } })
  t.true(await pathExists(`${FIXTURES_DIR}/npm_ci_lock/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/npm_ci_lock/plugin/node_modules`)
})

test.serial('Install local plugin dependencies: with npm in CI with no lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/npm_ci_no_lock/plugin/node_modules`)
  await del(`${FIXTURES_DIR}/npm_ci_no_lock/plugin/package-lock.json`, { force: true })

  await runFixture(t, 'npm_ci_no_lock', { env: { NETLIFY: 'true' } })

  t.true(await pathExists(`${FIXTURES_DIR}/npm_ci_no_lock/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/npm_ci_no_lock/plugin/node_modules`)
  t.true(await pathExists(`${FIXTURES_DIR}/npm_ci_no_lock/plugin/package-lock.json`))
  await del(`${FIXTURES_DIR}/npm_ci_no_lock/plugin/package-lock.json`, { force: true })
})

test.serial('Install local plugin dependencies: with yarn locally with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn_lock/plugin/node_modules`)
  await runFixture(t, 'yarn_lock')
  t.true(await pathExists(`${FIXTURES_DIR}/yarn_lock/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/yarn_lock/plugin/node_modules`)
})

test.serial('Install local plugin dependencies: with yarn in CI with lock file', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn_ci_lock/plugin/node_modules`)
  await runFixture(t, 'yarn_ci_lock', { env: { NETLIFY: 'true' } })
  t.true(await pathExists(`${FIXTURES_DIR}/yarn_ci_lock/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/yarn_ci_lock/plugin/node_modules`)
})

test.serial('Install local plugin dependencies: propagate errors', async t => {
  await runFixture(t, 'error')
})

test.serial('Install local plugin dependencies: already installed', async t => {
  await runFixture(t, 'already')
})

test.serial('Install local plugin dependencies: no package.json', async t => {
  await runFixture(t, 'no_package')
})

test.serial('Install local plugin dependencies: no root package.json', async t => {
  await runFixture(t, 'no_root_package', { copyRoot: {} })
})
