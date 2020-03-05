const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('constants.CONFIG_PATH', async t => {
  await runFixture(t, 'config')
})

test('constants.BUILD_DIR default value', async t => {
  await runFixture(t, 'build_default')
})

test('constants.BUILD_DIR default value with build.base', async t => {
  await runFixture(t, 'build_default_base')
})

test('constants.BUILD_DIR absolute path', async t => {
  await runFixture(t, 'build_absolute')
})

test('constants.BUILD_DIR relative path', async t => {
  await runFixture(t, 'build_relative')
})

test('constants.BUILD_DIR missing path', async t => {
  await runFixture(t, 'build_missing')
})

test('constants.FUNCTIONS_SRC default value', async t => {
  await runFixture(t, 'functions_src_default')
})

test('constants.FUNCTIONS_SRC relative path', async t => {
  await runFixture(t, 'functions_src_relative')
})

test('constants.FUNCTIONS_SRC automatic value', async t => {
  await runFixture(t, 'functions_src_auto')
})

test('constants.FUNCTIONS_SRC missing path', async t => {
  await runFixture(t, 'functions_src_missing')
})

test('constants.FUNCTIONS_DIST', async t => {
  await runFixture(t, 'functions_dist')
})

test('constants.CACHE_DIR local', async t => {
  await runFixture(t, 'cache')
})

test('constants.CACHE_DIR CI', async t => {
  await runFixture(t, 'cache', { env: { NETLIFY: 'true' } })
})

test('constants.SITE_ID', async t => {
  await runFixture(t, 'site_id', { flags: '--site-id test' })
})

test('constants.IS_LOCAL local', async t => {
  await runFixture(t, 'is_local')
})

test('constants.IS_LOCAL CI', async t => {
  await runFixture(t, 'is_local', { env: { NETLIFY: 'true' } })
})
