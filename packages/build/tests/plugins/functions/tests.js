const test = require('ava')

const { runFixture, FIXTURES_DIR, removeDir } = require('../../helpers/main')

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

test('Functions: install dependencies top-level', async t => {
  await removeDir([`${FIXTURES_DIR}/deps/.netlify/functions/`, `${FIXTURES_DIR}/deps/functions/node_modules/`])
  await runFixture(t, 'deps')
  await removeDir(`${FIXTURES_DIR}/deps/functions/node_modules/`)
})

test('Functions: install dependencies nested', async t => {
  await removeDir([
    `${FIXTURES_DIR}/deps_dir/.netlify/functions/`,
    `${FIXTURES_DIR}/deps_dir/functions/function/node_modules/`,
  ])
  await runFixture(t, 'deps_dir')
  await removeDir(`${FIXTURES_DIR}/deps_dir/functions/function/node_modules/`)
})

test('Functions: ignore package.json inside node_modules', async t => {
  await removeDir(`${FIXTURES_DIR}/deps_node_modules/.netlify/functions/`)
  await runFixture(t, 'deps_node_modules')
})
