const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('./helpers/main')

test('Functions: simple setup', async t => {
  await del(`${FIXTURES_DIR}/functions/.netlify/functions/`)
  await runFixture(t, 'functions')
})

test('Functions: invalid source directory', async t => {
  await runFixture(t, 'functions_invalid')
})

test('Functions: default directory', async t => {
  await del(`${FIXTURES_DIR}/functions_default/.netlify/functions/`)
  await runFixture(t, 'functions_default')
})

test('Functions: install dependencies top-level', async t => {
  await del([
    `${FIXTURES_DIR}/functions_deps/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_deps/functions/node_modules/`,
  ])
  await runFixture(t, 'functions_deps')
  await del(`${FIXTURES_DIR}/functions_deps/functions/node_modules/`)
})

test('Functions: install dependencies nested', async t => {
  await del([
    `${FIXTURES_DIR}/functions_deps_dir/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_deps_dir/functions/function/node_modules/`,
  ])
  await runFixture(t, 'functions_deps_dir')
  await del(`${FIXTURES_DIR}/functions_deps_dir/functions/function/node_modules/`)
})

test('Functions: ignore package.json inside node_modules', async t => {
  await del(`${FIXTURES_DIR}/functions_deps_node_modules/.netlify/functions/`)
  await runFixture(t, 'functions_deps_node_modules')
})
