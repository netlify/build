const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Functions: simple setup', async t => {
  await del(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  await runFixture(t, 'simple')
})

test('Functions: missing source directory', async t => {
  await del(`${FIXTURES_DIR}/missing/missing/`)
  await runFixture(t, 'missing')
})

test('Functions: default directory', async t => {
  await del(`${FIXTURES_DIR}/default/.netlify/functions/`)
  await runFixture(t, 'default')
})

test('Functions: install dependencies top-level', async t => {
  await del([`${FIXTURES_DIR}/deps/.netlify/functions/`, `${FIXTURES_DIR}/deps/functions/node_modules/`])
  await runFixture(t, 'deps')
  await del(`${FIXTURES_DIR}/deps/functions/node_modules/`)
})

test('Functions: install dependencies nested', async t => {
  await del([
    `${FIXTURES_DIR}/deps_dir/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_dir/functions/function/node_modules/`,
  ])
  await runFixture(t, 'deps_dir')
  await del(`${FIXTURES_DIR}/deps_dir/functions/function/node_modules/`)
})

test('Functions: ignore package.json inside node_modules', async t => {
  await del(`${FIXTURES_DIR}/deps_node_modules/.netlify/functions/`)
  await runFixture(t, 'deps_node_modules')
})
