import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

test('constants.CONFIG_PATH', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/config_path').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.PUBLISH_DIR default value', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/publish_default').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.PUBLISH_DIR default value with build.base', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/publish_default_base').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.PUBLISH_DIR absolute path', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/publish_absolute').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.PUBLISH_DIR relative path', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/publish_relative').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.PUBLISH_DIR missing path', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/publish_missing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC default value', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_default').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC uses legacy default functions directory if it exists', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_legacy').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC ignores the legacy default functions directory if the new default directory exists', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_default_and_legacy').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC relative path', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_relative').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC dynamic is ignored if FUNCTIONS_SRC is specified', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_dynamic_ignore')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC dynamic should bundle Functions', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_dynamic_bundle')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC automatic value', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_auto').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC missing path', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_missing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_SRC created dynamically', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_src_dynamic')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.INTERNAL_FUNCTIONS_SRC default value', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/internal_functions_src_default').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.FUNCTIONS_DIST', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_dist').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.CACHE_DIR local', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cache').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.CACHE_DIR CI', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cache')
    .withFlags({ cacheDir: '/opt/build/cache' })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.IS_LOCAL CI', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/is_local')
    .withFlags({ mode: 'buildbot' })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.SITE_ID', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/site_id').withFlags({ siteId: 'test' }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.ACCOUNT_ID', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/account_id')
    .withFlags({ accountId: 'test-account' })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.IS_LOCAL local', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/is_local').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.NETLIFY_BUILD_VERSION', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/netlify_build_version').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.NETLIFY_API_TOKEN', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/netlify_api_token')
    .withFlags({
      token: 'test',
      testOpts: { env: true },
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.NETLIFY_API_HOST', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/netlify_api_host')
    .withFlags({
      apiHost: 'test.api.netlify.com',
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.NETLIFY_API_HOST default value is set to api.netlify.com', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/netlify_api_host').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('constants.INTERNAL_EDGE_FUNCTIONS_SRC default value', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/internal_edge_functions_src').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
