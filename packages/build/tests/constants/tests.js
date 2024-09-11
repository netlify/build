import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('constants.CONFIG_PATH', async (t) => {
  const output = await new Fixture('./fixtures/config_path').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.PUBLISH_DIR default value', async (t) => {
  const output = await new Fixture('./fixtures/publish_default').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.PUBLISH_DIR default value with build.base', async (t) => {
  const output = await new Fixture('./fixtures/publish_default_base').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.PUBLISH_DIR absolute path', async (t) => {
  const output = await new Fixture('./fixtures/publish_absolute').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.PUBLISH_DIR relative path', async (t) => {
  const output = await new Fixture('./fixtures/publish_relative').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.PUBLISH_DIR missing path', async (t) => {
  const output = await new Fixture('./fixtures/publish_missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC default value', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_default').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC uses legacy default functions directory if it exists', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_legacy').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC ignores the legacy default functions directory if the new default directory exists', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_default_and_legacy').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC relative path', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_relative').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC dynamic is ignored if FUNCTIONS_SRC is specified', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_dynamic_ignore')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC dynamic should bundle Functions', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_dynamic_bundle')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC automatic value', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_auto').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC missing path', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_SRC created dynamically', async (t) => {
  const output = await new Fixture('./fixtures/functions_src_dynamic')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('constants.INTERNAL_FUNCTIONS_SRC default value', async (t) => {
  const output = await new Fixture('./fixtures/internal_functions_src_default').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.FUNCTIONS_DIST', async (t) => {
  const output = await new Fixture('./fixtures/functions_dist').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.CACHE_DIR local', async (t) => {
  const output = await new Fixture('./fixtures/cache').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.CACHE_DIR CI', async (t) => {
  const output = await new Fixture('./fixtures/cache').withFlags({ cacheDir: '/opt/build/cache' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.IS_LOCAL CI', async (t) => {
  const output = await new Fixture('./fixtures/is_local').withFlags({ mode: 'buildbot' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.SITE_ID', async (t) => {
  const output = await new Fixture('./fixtures/site_id').withFlags({ siteId: 'test' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.ACCOUNT_ID', async (t) => {
  const output = await new Fixture('./fixtures/account_id').withFlags({ accountId: 'test-account' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.IS_LOCAL local', async (t) => {
  const output = await new Fixture('./fixtures/is_local').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.NETLIFY_BUILD_VERSION', async (t) => {
  const output = await new Fixture('./fixtures/netlify_build_version').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.NETLIFY_API_TOKEN', async (t) => {
  const output = await new Fixture('./fixtures/netlify_api_token')
    .withFlags({
      token: 'test',
      testOpts: { env: true },
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.NETLIFY_API_HOST', async (t) => {
  const output = await new Fixture('./fixtures/netlify_api_host')
    .withFlags({
      apiHost: 'test.api.netlify.com',
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.NETLIFY_API_HOST default value is set to api.netlify.com', async (t) => {
  const output = await new Fixture('./fixtures/netlify_api_host').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.INTERNAL_EDGE_FUNCTIONS_SRC default value', async (t) => {
  const output = await new Fixture('./fixtures/internal_edge_functions_src').runWithBuild()
  t.snapshot(normalizeOutput(output))
})
