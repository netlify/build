import { existsSync } from 'fs'
import { copyFile, rm } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

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

test('updateConfig() saves netlify.toml', async (t) => {
  const { configPath } = await runUpdateConfig('save')
  t.true(existsSync(configPath))
})

test('updateConfig() updates the configuration so it can be read again', async (t) => {
  const { configPath } = await runUpdateConfig('update')
  const output = await new Fixture('./fixtures/update').withFlags({ config: configPath }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('updateConfig() is a noop when where are no config mutations', async (t) => {
  const { configPath } = await runUpdateConfig('noop', { configMutations: [] })
  t.false(existsSync(configPath))
})

test('updateConfig() has higher priority than context properties', async (t) => {
  const { configPath } = await runUpdateConfig('context')
  const output = await new Fixture('./fixtures/context').withFlags({ config: configPath }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('updateConfig() merges with the existing netlify.toml', async (t) => {
  const { configPath } = await runUpdateConfig('merge')
  const output = await new Fixture('./fixtures/merge').withFlags({ config: configPath }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('updateConfig() deletes _redirects when redirects were changed', async (t) => {
  const { redirectsPath } = await runUpdateConfig('redirects_change', { configMutations: [redirectsMutation] })
  t.is(typeof redirectsPath, 'string')
  t.false(existsSync(redirectsPath))
})

test('updateConfig() deletes _redirects on changes even if redirects were not changed', async (t) => {
  const { redirectsPath } = await runUpdateConfig('redirects_no_change')
  t.is(typeof redirectsPath, 'string')
  t.false(existsSync(redirectsPath))
})

test('updateConfig() does not delete _redirects if it does not exist', async (t) => {
  const { redirectsPath } = await runUpdateConfig('redirects_none')
  t.is(typeof redirectsPath, 'string')
  t.false(existsSync(redirectsPath))
})

test('updateConfig() does not delete _redirects if redirectsPath not provided', async (t) => {
  const { redirectsPath } = await runUpdateConfig('redirects_undefined', {
    configMutations: [redirectsMutation],
    redirectsPath: undefined,
  })
  t.is(typeof redirectsPath, 'string')
  t.true(existsSync(redirectsPath))
})

test('updateConfig() deletes _headers when headers were changed', async (t) => {
  const { headersPath } = await runUpdateConfig('headers_change', { configMutations: [headersMutation] })
  t.is(typeof headersPath, 'string')
  t.false(existsSync(headersPath))
})

test('updateConfig() deletes _headers on changes even if headers were not changed', async (t) => {
  const { headersPath } = await runUpdateConfig('headers_no_change')
  t.is(typeof headersPath, 'string')
  t.false(existsSync(headersPath))
})

test('updateConfig() does not delete _headers if it does not exist', async (t) => {
  const { headersPath } = await runUpdateConfig('headers_none')
  t.is(typeof headersPath, 'string')
  t.false(existsSync(headersPath))
})

test('updateConfig() does not delete _headers if headersPath not provided', async (t) => {
  const { headersPath } = await runUpdateConfig('headers_undefined', {
    configMutations: [headersMutation],
    headersPath: undefined,
  })
  t.is(typeof headersPath, 'string')
  t.true(existsSync(headersPath))
})

test('Programmatic resolveConfig with configMutations', async (t) => {
  const { config } = await resolveConfig({
    mode: 'cli',
    context: 'production',
    configMutations: [{ keys: ['functions', 'directory'], value: 'new_functions', event: 'onPreBuild' }],
  })
  t.is(config.functionsDirectory, join(process.cwd(), 'new_functions'))
  t.is(config.build.functions, join(process.cwd(), 'new_functions'))
})

test('Programmatic resolveConfig with configMutations and defaultConfig', async (t) => {
  const { config } = await resolveConfig({
    mode: 'cli',
    context: 'production',
    defaultConfig: {
      functionsDirectory: 'functions',
      build: { functions: 'functions' },
    },
    configMutations: [{ keys: ['functions', 'directory'], value: 'new_functions', event: 'onPreBuild' }],
  })

  t.is(config.functionsDirectory, join(process.cwd(), 'new_functions'))
  t.is(config.build.functions, join(process.cwd(), 'new_functions'))
})
