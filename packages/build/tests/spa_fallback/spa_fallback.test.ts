import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

const SPA_FALLBACK_REDIRECT = {
  conditions: {},
  headers: {},
  force: false,
  from: '/*',
  query: {},
  status: 200,
  to: '/index.html',
}

test('Injects an SPA fallback redirect when `spa_fallback` is `true`', async () => {
  const { netlifyConfig, success } = await new Fixture(
    import.meta.url,
    './fixtures/spa_enabled',
  ).runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(netlifyConfig?.redirects).toEqual([SPA_FALLBACK_REDIRECT])
})

test('Does not inject an SPA fallback redirect when `spa_fallback` is `false`', async () => {
  const { netlifyConfig, success } = await new Fixture(
    import.meta.url,
    './fixtures/spa_disabled',
  ).runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(netlifyConfig?.redirects).toEqual([])
})

test('Does not inject an SPA fallback redirect when `spa_fallback` is not set', async () => {
  const { netlifyConfig, success } = await new Fixture(
    import.meta.url,
    './fixtures/spa_default',
  ).runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(netlifyConfig?.redirects).toEqual([])
})

test('Does not override a mismatched catch-all redirect already declared by the user, and warns about it', async () => {
  const { netlifyConfig, success, output } = await new Fixture(
    import.meta.url,
    './fixtures/spa_enabled_existing_catch_all',
  ).runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(netlifyConfig?.redirects).toEqual([{ ...SPA_FALLBACK_REDIRECT, to: '/200.html' }])
  expect(output).toContain('a catch-all redirect ("/*") already exists that does not rewrite to "/index.html"')
})

test('Does not warn when the existing catch-all redirect already matches what Netlify would add', async () => {
  const { netlifyConfig, success, output } = await new Fixture(
    import.meta.url,
    './fixtures/spa_enabled_existing_correct_catch_all',
  ).runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(netlifyConfig?.redirects).toEqual([SPA_FALLBACK_REDIRECT])
  expect(output).not.toContain('already exists')
})
