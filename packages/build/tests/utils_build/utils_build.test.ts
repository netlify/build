import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

const CANCEL_PATH = '/api/v1/deploys/test/cancel'

test('build.failBuild()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/fail_build').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.failBuild() error option', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/fail_build_error_option').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.failBuild() inside a callback', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/fail_build_callback').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.failBuild() is not available within post-deploy events', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/fail_build_post_deploy').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.failPlugin()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/fail_plugin').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.failPlugin() inside a callback', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/fail_plugin_callback').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.failPlugin() error option', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/fail_plugin_error_option').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.cancelBuild()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cancel').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.cancelBuild() inside a callback', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cancel_callback').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.cancelBuild() error option', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cancel_error_option').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.cancelBuild() API call', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/cancel')
    .withFlags({ token: 'test', deployId: 'test' })
    .runBuildServer({ path: CANCEL_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(requests).toMatchSnapshot()
})

test('build.cancelBuild() API call no DEPLOY_ID', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/cancel')
    .withFlags({ token: 'test' })
    .runBuildServer({ path: CANCEL_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(requests).toHaveLength(0)
})

test('build.cancelBuild() API call no token', async () => {
  const { requests, output } = await new Fixture(import.meta.url, './fixtures/cancel')
    .withFlags({ deployId: 'test' })
    .runBuildServer({ path: CANCEL_PATH })
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(requests).toHaveLength(0)
})

test('build.cancelBuild() API call failure', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cancel')
    .withFlags({ token: 'test', deployId: 'test', testOpts: { host: '...', env: true } })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.cancelBuild() is not available within post-deploy events', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/cancel_post_deploy').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
