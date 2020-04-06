const test = require('ava')
const del = require('del')
const pathExists = require('path-exists')

const { removeDir } = require('../../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

// Need to run `npm install` and `yarn` serially to avoid network errors
test.serial('Functions: install dependencies nested', async t => {
  await removeDir([`${FIXTURES_DIR}/dir/.netlify/functions/`, `${FIXTURES_DIR}/dir/functions/function/node_modules/`])
  await runFixture(t, 'dir')
  t.true(await pathExists(`${FIXTURES_DIR}/dir/functions/function/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/dir/.netlify/functions/`, `${FIXTURES_DIR}/dir/functions/function/node_modules/`])
})

test.serial('Functions: ignore package.json inside node_modules', async t => {
  await removeDir(`${FIXTURES_DIR}/node_modules/.netlify/functions/`)
  await runFixture(t, 'node_modules')
})

test.serial('Functions: install dependencies with npm locally with lock file', async t => {
  await removeDir([`${FIXTURES_DIR}/npm_lock/.netlify/functions/`, `${FIXTURES_DIR}/npm_lock/functions/node_modules/`])
  await runFixture(t, 'npm_lock')
  t.true(await pathExists(`${FIXTURES_DIR}/npm_lock/functions/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/npm_lock/.netlify/functions/`, `${FIXTURES_DIR}/npm_lock/functions/node_modules/`])
})

test.serial('Functions: install dependencies with npm in CI with no lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/npm_ci_no_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/npm_ci_no_lock/functions/node_modules/`,
  ])

  await runFixture(t, 'npm_ci_no_lock', { flags: '--mode=buildbot' })

  t.true(await pathExists(`${FIXTURES_DIR}/npm_ci_no_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/npm_ci_no_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/npm_ci_no_lock/functions/node_modules/`,
  ])
  t.true(await pathExists(`${FIXTURES_DIR}/npm_ci_no_lock/functions/package-lock.json`))
  await del(`${FIXTURES_DIR}/npm_ci_no_lock/functions/package-lock.json`, { force: true })
})

test.serial('Functions: install dependencies with npm in CI with lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/npm_ci_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/npm_ci_lock/functions/node_modules/`,
  ])
  await runFixture(t, 'npm_ci_lock', { flags: '--mode=buildbot' })
  t.true(await pathExists(`${FIXTURES_DIR}/npm_ci_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/npm_ci_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/npm_ci_lock/functions/node_modules/`,
  ])
})

test.serial('Functions: install dependencies with Yarn locally with lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/yarn_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/yarn_lock/functions/node_modules/`,
  ])
  await runFixture(t, 'yarn_lock')
  t.true(await pathExists(`${FIXTURES_DIR}/yarn_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/yarn_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/yarn_lock/functions/node_modules/`,
  ])
})

test.serial('Functions: install dependencies with Yarn in CI with lock file', async t => {
  await removeDir([
    `${FIXTURES_DIR}/yarn_ci_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/yarn_ci_lock/functions/node_modules/`,
  ])
  await runFixture(t, 'yarn_ci_lock', { flags: '--mode=buildbot' })
  t.true(await pathExists(`${FIXTURES_DIR}/yarn_ci_lock/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/yarn_ci_lock/.netlify/functions/`,
    `${FIXTURES_DIR}/yarn_ci_lock/functions/node_modules/`,
  ])
})
