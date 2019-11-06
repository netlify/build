const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('./helpers/main')

test('constants.CACHE_DIR', async t => {
  await runFixture(t, 'constants_cache')
})

test('constants.CONFIG_PATH', async t => {
  await runFixture(t, 'constants_config')
})

test('constants.BUILD_DIR default value', async t => {
  await runFixture(t, 'constants_build_default')
})

test('constants.BUILD_DIR absolute path', async t => {
  await runFixture(t, 'constants_build_absolute')
})

test('constants.BUILD_DIR relative path', async t => {
  await runFixture(t, 'constants_build_relative')
})

test('constants.BUILD_DIR automatic value', async t => {
  await runFixture(t, 'constants_build_auto')
  await del(`${FIXTURES_DIR}/constants_build_auto/.netlify/build`)
})

test('constants.BUILD_DIR missing path', async t => {
  await del(`${FIXTURES_DIR}/constants_build_missing/publish`)
  await runFixture(t, 'constants_build_missing')
})

test('constants.FUNCTIONS_SRC default value', async t => {
  await runFixture(t, 'constants_functions_src_default')
})

test('constants.FUNCTIONS_SRC relative path', async t => {
  await runFixture(t, 'constants_functions_src_relative')
})

test('constants.FUNCTIONS_SRC automatic value', async t => {
  await runFixture(t, 'constants_functions_src_auto')
})

test('constants.FUNCTIONS_SRC missing path', async t => {
  await del(`${FIXTURES_DIR}/constants_functions_src_missing/missing`)
  await runFixture(t, 'constants_functions_src_missing')
})

test('constants.FUNCTIONS_DIST', async t => {
  await runFixture(t, 'constants_functions_dist')
})
