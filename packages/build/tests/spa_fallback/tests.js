import { Fixture } from '@netlify/testing'
import test from 'ava'

const SPA_FALLBACK_REDIRECT = {
  conditions: {},
  headers: {},
  force: false,
  from: '/*',
  query: {},
  status: 200,
  to: '/index.html',
}

test('Injects an SPA fallback redirect when `build.spa` is `true`', async (t) => {
  const { netlifyConfig, success } = await new Fixture('./fixtures/spa_enabled').runWithBuildAndIntrospect()

  t.true(success)
  t.deepEqual(netlifyConfig.redirects, [SPA_FALLBACK_REDIRECT])
})

test('Does not inject an SPA fallback redirect when `build.spa` is `false`', async (t) => {
  const { netlifyConfig, success } = await new Fixture('./fixtures/spa_disabled').runWithBuildAndIntrospect()

  t.true(success)
  t.deepEqual(netlifyConfig.redirects, [])
})

test('Does not inject an SPA fallback redirect when `build.spa` is not set', async (t) => {
  const { netlifyConfig, success } = await new Fixture('./fixtures/spa_default').runWithBuildAndIntrospect()

  t.true(success)
  t.deepEqual(netlifyConfig.redirects, [])
})

test('Does not override a catch-all redirect already declared by the user', async (t) => {
  const { netlifyConfig, success } = await new Fixture(
    './fixtures/spa_enabled_existing_catch_all',
  ).runWithBuildAndIntrospect()

  t.true(success)
  t.deepEqual(netlifyConfig.redirects, [{ ...SPA_FALLBACK_REDIRECT, to: '/200.html' }])
})
