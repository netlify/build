const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('constants.CACHE_DIR local', async t => {
  await runFixture(t, 'cache')
})

test('constants.CACHE_DIR CI', async t => {
  await runFixture(t, 'cache', { env: { DEPLOY_PRIME_URL: 'test' } })
})

test('constants.CONFIG_PATH', async t => {
  await runFixture(t, 'config')
})

test('constants.BUILD_DIR default value', async t => {
  await runFixture(t, 'build_default')
})

test('constants.BUILD_DIR absolute path', async t => {
  await runFixture(t, 'build_absolute')
})

test('constants.BUILD_DIR relative path', async t => {
  await runFixture(t, 'build_relative')
})

test('constants.BUILD_DIR automatic value', async t => {
  await del(`${FIXTURES_DIR}/build_auto/.netlify/build`)
  await runFixture(t, 'build_auto')
})

test('constants.BUILD_DIR missing path', async t => {
  await del(`${FIXTURES_DIR}/build_missing/publish`)
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
  await del(`${FIXTURES_DIR}/functions_src_missing/missing`)
  await runFixture(t, 'functions_src_missing')
})

test('constants.FUNCTIONS_DIST', async t => {
  await runFixture(t, 'functions_dist')
})
