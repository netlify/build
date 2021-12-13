'use strict'

const test = require('ava')

const { runFixture } = require('../helpers/main')

test('constants.CONFIG_PATH', async (t) => {
  await runFixture(t, 'config_path')
})

test('constants.PUBLISH_DIR default value', async (t) => {
  await runFixture(t, 'publish_default')
})

test('constants.PUBLISH_DIR default value with build.base', async (t) => {
  await runFixture(t, 'publish_default_base')
})

test('constants.PUBLISH_DIR absolute path', async (t) => {
  await runFixture(t, 'publish_absolute')
})

test('constants.PUBLISH_DIR relative path', async (t) => {
  await runFixture(t, 'publish_relative')
})

test('constants.PUBLISH_DIR missing path', async (t) => {
  await runFixture(t, 'publish_missing')
})

test('constants.FUNCTIONS_SRC default value', async (t) => {
  await runFixture(t, 'functions_src_default')
})

test('constants.FUNCTIONS_SRC uses legacy default functions directory if it exists', async (t) => {
  await runFixture(t, 'functions_src_legacy')
})

test('constants.FUNCTIONS_SRC ignores the legacy default functions directory if the new default directory exists', async (t) => {
  await runFixture(t, 'functions_src_default_and_legacy')
})

test('constants.FUNCTIONS_SRC relative path', async (t) => {
  await runFixture(t, 'functions_src_relative')
})

test('constants.FUNCTIONS_SRC dynamic is ignored if FUNCTIONS_SRC is specified', async (t) => {
  await runFixture(t, 'functions_src_dynamic_ignore', { copyRoot: { git: false } })
})

test('constants.FUNCTIONS_SRC dynamic should bundle Functions', async (t) => {
  await runFixture(t, 'functions_src_dynamic_bundle', { copyRoot: { git: false } })
})

test('constants.FUNCTIONS_SRC automatic value', async (t) => {
  await runFixture(t, 'functions_src_auto')
})

test('constants.FUNCTIONS_SRC missing path', async (t) => {
  await runFixture(t, 'functions_src_missing')
})

test('constants.FUNCTIONS_SRC created dynamically', async (t) => {
  await runFixture(t, 'functions_src_dynamic', { copyRoot: { git: false } })
})

test('constants.INTERNAL_FUNCTIONS_SRC default value', async (t) => {
  await runFixture(t, 'internal_functions_src_default')
})

test('constants.FUNCTIONS_DIST', async (t) => {
  await runFixture(t, 'functions_dist')
})

test('constants.CACHE_DIR local', async (t) => {
  await runFixture(t, 'cache')
})

test('constants.CACHE_DIR CI', async (t) => {
  await runFixture(t, 'cache', { flags: { cacheDir: '/opt/build/cache' } })
})

test('constants.IS_LOCAL CI', async (t) => {
  await runFixture(t, 'is_local', { flags: { mode: 'buildbot' } })
})

test('constants.SITE_ID', async (t) => {
  await runFixture(t, 'site_id', { flags: { siteId: 'test' } })
})

test('constants.IS_LOCAL local', async (t) => {
  await runFixture(t, 'is_local')
})

test('constants.NETLIFY_BUILD_VERSION', async (t) => {
  await runFixture(t, 'netlify_build_version')
})

test('constants.NETLIFY_API_TOKEN', async (t) => {
  await runFixture(t, 'netlify_api_token', { flags: { token: 'test', testOpts: { env: false } } })
})

test('constants.NETLIFY_API_HOST', async (t) => {
  await runFixture(t, 'netlify_api_host', { flags: { apiHost: 'test.api.netlify.com' } })
})

test('constants.NETLIFY_API_HOST default value is set to api.netlify.com', async (t) => {
  await runFixture(t, 'netlify_api_host')
})
