'use strict'

const test = require('ava')
// @todo replace with `fs.copyFile()` after dropping support for Node 8
const cpFile = require('cp-file')
const del = require('del')
const pathExists = require('path-exists')

const { updateConfig } = require('../..')
const { runFixture } = require('../helpers/main')

const FIXTURES_DIR = `${__dirname}/fixtures`

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
  if (await pathExists(fixturePath)) {
    await cpFile(fixturePath, tempPath)
    return
  }

  if (await pathExists(tempPath)) {
    await del(tempPath)
  }
}

test('updateConfig() saves netlify.toml', async (t) => {
  const { configPath } = await runUpdateConfig('save')
  t.true(await pathExists(configPath))
})

test('updateConfig() updates the configuration so it can be read again', async (t) => {
  const { configPath } = await runUpdateConfig('update')
  await runFixture(t, 'update', { flags: { config: configPath } })
})

test('updateConfig() is a noop when where are no config mutations', async (t) => {
  const { configPath } = await runUpdateConfig('noop', { configMutations: [] })
  t.false(await pathExists(configPath))
})

test('updateConfig() has higher priority than context properties', async (t) => {
  const { configPath } = await runUpdateConfig('context')
  await runFixture(t, 'context', { flags: { config: configPath } })
})

test('updateConfig() merges with the existing netlify.toml', async (t) => {
  const { configPath } = await runUpdateConfig('merge')
  await runFixture(t, 'merge', { flags: { config: configPath } })
})

test('updateConfig() deletes _redirects when redirects were changed', async (t) => {
  const { redirectsPath } = await runUpdateConfig('redirects_change', { configMutations: [redirectsMutation] })
  t.is(typeof redirectsPath, 'string')
  t.false(await pathExists(redirectsPath))
})

test('updateConfig() does not delete _redirects when redirects were not changed', async (t) => {
  const { redirectsPath } = await runUpdateConfig('redirects_no_change')
  t.is(typeof redirectsPath, 'string')
  t.true(await pathExists(redirectsPath))
})

test('updateConfig() does not delete _redirects if it does not exist', async (t) => {
  const { redirectsPath } = await runUpdateConfig('redirects_none')
  t.is(typeof redirectsPath, 'string')
  t.false(await pathExists(redirectsPath))
})

test('updateConfig() does not delete _redirects if redirectsPath not provided', async (t) => {
  const { redirectsPath } = await runUpdateConfig('redirects_undefined', {
    configMutations: [redirectsMutation],
    redirectsPath: undefined,
  })
  t.is(typeof redirectsPath, 'string')
  t.true(await pathExists(redirectsPath))
})

test('updateConfig() deletes _headers when headers were changed', async (t) => {
  const { headersPath } = await runUpdateConfig('headers_change', { configMutations: [headersMutation] })
  t.is(typeof headersPath, 'string')
  t.false(await pathExists(headersPath))
})

test('updateConfig() does not delete _headers when headers were not changed', async (t) => {
  const { headersPath } = await runUpdateConfig('headers_no_change')
  t.is(typeof headersPath, 'string')
  t.true(await pathExists(headersPath))
})

test('updateConfig() does not delete _headers if it does not exist', async (t) => {
  const { headersPath } = await runUpdateConfig('headers_none')
  t.is(typeof headersPath, 'string')
  t.false(await pathExists(headersPath))
})

test('updateConfig() does not delete _headers if headersPath not provided', async (t) => {
  const { headersPath } = await runUpdateConfig('headers_undefined', {
    configMutations: [headersMutation],
    headersPath: undefined,
  })
  t.is(typeof headersPath, 'string')
  t.true(await pathExists(headersPath))
})
