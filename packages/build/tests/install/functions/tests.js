const test = require('ava')
const pathExists = require('path-exists')

const { removeDir } = require('../../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Functions: install dependencies nested', async t => {
  await removeDir([`${FIXTURES_DIR}/dir/.netlify/functions/`, `${FIXTURES_DIR}/dir/functions/function/node_modules/`])
  await runFixture(t, 'dir')
  t.true(await pathExists(`${FIXTURES_DIR}/dir/functions/function/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/dir/.netlify/functions/`, `${FIXTURES_DIR}/dir/functions/function/node_modules/`])
})

test('Functions: ignore package.json inside node_modules', async t => {
  await removeDir(`${FIXTURES_DIR}/node_modules/.netlify/functions/`)
  await runFixture(t, 'node_modules')
})

test('Functions: install dependencies with npm', async t => {
  await removeDir([`${FIXTURES_DIR}/npm/.netlify/functions/`, `${FIXTURES_DIR}/npm/functions/node_modules/`])
  await runFixture(t, 'npm')
  t.true(await pathExists(`${FIXTURES_DIR}/npm/functions/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/npm/.netlify/functions/`, `${FIXTURES_DIR}/npm/functions/node_modules/`])
})

test('Functions: install dependencies with Yarn locally', async t => {
  await removeDir([`${FIXTURES_DIR}/yarn/.netlify/functions/`, `${FIXTURES_DIR}/yarn/functions/node_modules/`])
  await runFixture(t, 'yarn')
  t.true(await pathExists(`${FIXTURES_DIR}/yarn/functions/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/yarn/.netlify/functions/`, `${FIXTURES_DIR}/yarn/functions/node_modules/`])
})

test('Functions: install dependencies with Yarn in CI', async t => {
  await removeDir([`${FIXTURES_DIR}/yarn_ci/.netlify/functions/`, `${FIXTURES_DIR}/yarn_ci/functions/node_modules/`])
  await runFixture(t, 'yarn_ci', { flags: { mode: 'buildbot' } })
  t.true(await pathExists(`${FIXTURES_DIR}/yarn_ci/functions/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/yarn_ci/.netlify/functions/`, `${FIXTURES_DIR}/yarn_ci/functions/node_modules/`])
})

test('Functions: does not install dependencies unless opting in', async t => {
  await removeDir([`${FIXTURES_DIR}/optional/.netlify/functions/`, `${FIXTURES_DIR}/optional/functions/node_modules/`])
  await runFixture(t, 'optional')
  t.false(await pathExists(`${FIXTURES_DIR}/optional/functions/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/optional/.netlify/functions/`, `${FIXTURES_DIR}/optional/functions/node_modules/`])
})

test('Functions: does not print warnings when dependency was mispelled', async t => {
  await removeDir([
    `${FIXTURES_DIR}/mispelled_dep/.netlify/functions/`,
    `${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`,
  ])
  await runFixture(t, 'mispelled_dep')
  t.false(await pathExists(`${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/mispelled_dep/.netlify/functions/`,
    `${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`,
  ])
})
