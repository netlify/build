const test = require('ava')
const pathExists = require('path-exists')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { removeDir } = require('../../helpers/dir')

test('Functions: simple setup', async t => {
  await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  await runFixture(t, 'simple')
})

test('Functions: missing source directory', async t => {
  await runFixture(t, 'missing')
})

test('Functions: no functions', async t => {
  await runFixture(t, 'none')
})

test('Functions: default directory', async t => {
  await runFixture(t, 'default')
})

// Need to run `npm install` and `yarn` serially to avoid network errors
test.serial('Functions: install dependencies nested', async t => {
  await removeDir([
    `${FIXTURES_DIR}/deps_dir/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_dir/functions/function/node_modules/`,
  ])
  await runFixture(t, 'deps_dir')
  t.true(await pathExists(`${FIXTURES_DIR}/deps_dir/functions/function/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/deps_dir/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_dir/functions/function/node_modules/`,
  ])
})

test.serial('Functions: ignore package.json inside node_modules', async t => {
  await removeDir(`${FIXTURES_DIR}/deps_node_modules/.netlify/functions/`)
  await runFixture(t, 'deps_node_modules')
})

test.serial('Functions: install dependencies with npm locally with lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/deps_npm_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_npm_lock/functions/node_modules/`,
  ])
  await runFixture(t, 'deps_npm_lock')
  t.true(await pathExists(`${FIXTURES_DIR}/deps_npm_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/deps_npm_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_npm_lock/functions/node_modules/`,
  ])
})

test.serial('Functions: install dependencies with npm in CI with no lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/deps_npm_ci_no_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_npm_ci_no_lock/functions/node_modules/`,
  ])

  await runFixture(t, 'deps_npm_ci_no_lock', { env: { NETLIFY: 'true' } })

  t.true(await pathExists(`${FIXTURES_DIR}/deps_npm_ci_no_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/deps_npm_ci_no_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_npm_ci_no_lock/functions/node_modules/`,
  ])
  t.true(await pathExists(`${FIXTURES_DIR}/deps_npm_ci_no_lock/functions/package-lock.json`))
  await del(`${FIXTURES_DIR}/deps_npm_ci_no_lock/functions/package-lock.json`, { force: true })
})

test.serial('Functions: install dependencies with npm in CI with lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/deps_npm_ci_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_npm_ci_lock/functions/node_modules/`,
  ])
  await runFixture(t, 'deps_npm_ci_lock', { env: { NETLIFY: 'true' } })
  t.true(await pathExists(`${FIXTURES_DIR}/deps_npm_ci_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/deps_npm_ci_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_npm_ci_lock/functions/node_modules/`,
  ])
})

test.serial('Functions: install dependencies with Yarn locally with lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/deps_yarn_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_yarn_lock/functions/node_modules/`,
  ])
  await runFixture(t, 'deps_yarn_lock')
  t.true(await pathExists(`${FIXTURES_DIR}/deps_yarn_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/deps_yarn_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_yarn_lock/functions/node_modules/`,
  ])
})

test.serial('Functions: install dependencies with Yarn in CI with lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/deps_yarn_ci_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_yarn_ci_lock/functions/node_modules/`,
  ])
  await runFixture(t, 'deps_yarn_ci_lock', { env: { NETLIFY: 'true' } })
  t.true(await pathExists(`${FIXTURES_DIR}/deps_yarn_ci_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/deps_yarn_ci_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_yarn_ci_lock/functions/node_modules/`,
  ])
})
