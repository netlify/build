const test = require('ava')

const { runFixture } = require('./helpers/main')

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

test('constants.FUNCTIONS_SRC default value', async t => {
  await runFixture(t, 'constants_functions_src_default')
})

test('constants.FUNCTIONS_SRC relative path', async t => {
  await runFixture(t, 'constants_functions_src_relative')
})

test('constants.FUNCTIONS_SRC automatic value', async t => {
  await runFixture(t, 'constants_functions_src_auto')
})

test('constants.FUNCTIONS_DIST', async t => {
  await runFixture(t, 'constants_functions_dist')
})
