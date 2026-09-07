import { existsSync } from 'fs'
import { copyFile, rm } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

import { updateConfig } from '../../lib/index.js'
import { resolveConfig } from '../../lib/main.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

// Call the main function
const runUpdateConfig = async function (fixtureName, { configMutations = [buildCommandMutation], ...opts } = {}) {
  const { configPath, headersPath, redirectsPath, buildDir } = await initFixtureDir(fixtureName)
  await updateConfig(configMutations, {
    buildDir,
    configPath,
    headersPath,
    redirectsPath,
    context: 'production',
    branch: 'main',
    ...opts,
  })
  return { configPath, headersPath, redirectsPath }
}

// `configMutations` used for testing
const buildCommandMutation = { keys: ['build', 'command'], value: 'test', event: 'onPreBuild' }
const headersMutation = { keys: ['headers'], value: [{ for: '/path', values: { test: 'one' } }], event: 'onPreBuild' }
const redirectsMutation = { keys: ['redirects'], value: [{ from: '/one', to: '/two' }], event: 'onPreBuild' }

// Initialize the fixture directory
const initFixtureDir = async function (fixtureName) {
  const fixtureDir = `${FIXTURES_DIR}/${fixtureName}`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureHeadersPath = `${fixtureDir}/_headers`
  const headersPath = `${fixtureDir}/test_headers`
  const fixtureRedirectsPath = `${fixtureDir}/_redirects`
  const redirectsPath = `${fixtureDir}/test_redirects`
  await Promise.all([
    copyIfExists(fixtureConfigPath, configPath),
    copyIfExists(fixtureHeadersPath, headersPath),
    copyIfExists(fixtureRedirectsPath, redirectsPath),
  ])
  return { configPath, headersPath, redirectsPath, buildDir: fixtureDir }
}

// Create temporary copies of `netlify.toml` and `redirects` from the fixture
// directory to use in tests
const copyIfExists = async function (fixturePath, tempPath) {
  if (existsSync(fixturePath)) {
    await copyFile(fixturePath, tempPath)
    return
  }

  if (existsSync(tempPath)) {
    await rm(tempPath, { force: true, recursive: true, maxRetries: 10 })
  }
}

test('updateConfig() saves netlify.toml', async () => {
  const { configPath } = await runUpdateConfig('save')
  expect(existsSync(configPath)).toBe(true)
})

test('updateConfig() updates the configuration so it can be read again', async () => {
  const { configPath } = await runUpdateConfig('update')
  const output = await new Fixture(import.meta.url, './fixtures/update')
    .withFlags({ config: configPath })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('updateConfig() is a noop when where are no config mutations', async () => {
  const { configPath } = await runUpdateConfig('noop', { configMutations: [] })
  expect(existsSync(configPath)).toBe(false)
})

test('updateConfig() has higher priority than context properties', async () => {
  const { configPath } = await runUpdateConfig('context')
  const output = await new Fixture(import.meta.url, './fixtures/context')
    .withFlags({ config: configPath })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('updateConfig() merges with the existing netlify.toml', async () => {
  const { configPath } = await runUpdateConfig('merge')
  const output = await new Fixture(import.meta.url, './fixtures/merge')
    .withFlags({ config: configPath })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('updateConfig() deletes _redirects when redirects were changed', async () => {
  const { redirectsPath } = await runUpdateConfig('redirects_change', { configMutations: [redirectsMutation] })
  expect(typeof redirectsPath).toBe('string')
  expect(existsSync(redirectsPath)).toBe(false)
})

test('updateConfig() deletes _redirects on changes even if redirects were not changed', async () => {
  const { redirectsPath } = await runUpdateConfig('redirects_no_change')
  expect(typeof redirectsPath).toBe('string')
  expect(existsSync(redirectsPath)).toBe(false)
})

test('updateConfig() does not delete _redirects if it does not exist', async () => {
  const { redirectsPath } = await runUpdateConfig('redirects_none')
  expect(typeof redirectsPath).toBe('string')
  expect(existsSync(redirectsPath)).toBe(false)
})

test('updateConfig() does not delete _redirects if redirectsPath not provided', async () => {
  const { redirectsPath } = await runUpdateConfig('redirects_undefined', {
    configMutations: [redirectsMutation],
    redirectsPath: undefined,
  })
  expect(typeof redirectsPath).toBe('string')
  expect(existsSync(redirectsPath)).toBe(true)
})

test('updateConfig() deletes _headers when headers were changed', async () => {
  const { headersPath } = await runUpdateConfig('headers_change', { configMutations: [headersMutation] })
  expect(typeof headersPath).toBe('string')
  expect(existsSync(headersPath)).toBe(false)
})

test('updateConfig() deletes _headers on changes even if headers were not changed', async () => {
  const { headersPath } = await runUpdateConfig('headers_no_change')
  expect(typeof headersPath).toBe('string')
  expect(existsSync(headersPath)).toBe(false)
})

test('updateConfig() does not delete _headers if it does not exist', async () => {
  const { headersPath } = await runUpdateConfig('headers_none')
  expect(typeof headersPath).toBe('string')
  expect(existsSync(headersPath)).toBe(false)
})

test('updateConfig() does not delete _headers if headersPath not provided', async () => {
  const { headersPath } = await runUpdateConfig('headers_undefined', {
    configMutations: [headersMutation],
    headersPath: undefined,
  })
  expect(typeof headersPath).toBe('string')
  expect(existsSync(headersPath)).toBe(true)
})

test('Programmatic resolveConfig with configMutations', async () => {
  const { config } = await resolveConfig({
    mode: 'cli',
    context: 'production',
    configMutations: [{ keys: ['functions', 'directory'], value: 'new_functions', event: 'onPreBuild' }],
  })
  expect(config.functionsDirectory).toBe(join(process.cwd(), 'new_functions'))
  expect(config.build.functions).toBe(join(process.cwd(), 'new_functions'))
})

test('Programmatic resolveConfig with configMutations and defaultConfig', async () => {
  const { config } = await resolveConfig({
    mode: 'cli',
    context: 'production',
    defaultConfig: {
      functionsDirectory: 'functions',
      build: { functions: 'functions' },
    },
    configMutations: [{ keys: ['functions', 'directory'], value: 'new_functions', event: 'onPreBuild' }],
  })

  expect(config.functionsDirectory).toBe(join(process.cwd(), 'new_functions'))
  expect(config.build.functions).toBe(join(process.cwd(), 'new_functions'))
})
