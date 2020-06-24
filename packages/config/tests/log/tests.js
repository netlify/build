const test = require('ava')

const { runFixture } = require('../helpers/main')

test('Prints some information in debug mode', async t => {
  await runFixture(t, 'simple', { flags: { debug: true }, useBinary: true })
})

test('Does not print confidential information in debug mode', async t => {
  const defaultConfig = JSON.stringify({ build: { environment: { SECRET: 'true' } } })
  await runFixture(t, 'simple', { flags: { debug: true, defaultConfig, env: { SECRET: 'true' } }, useBinary: true })
})

test('Debug mode can be enabled using the NETLIFY_BUILD_DEBUG environment variable', async t => {
  await runFixture(t, 'simple', { flags: { env: { NETLIFY_BUILD_DEBUG: 'true' } }, useBinary: true })
})

test('Debug mode can be enabled using the NETLIFY_BUILD_DEBUG environment UI setting', async t => {
  const defaultConfig = JSON.stringify({ build: { environment: { NETLIFY_BUILD_DEBUG: 'true' } } })
  await runFixture(t, 'simple', { flags: { defaultConfig }, useBinary: true })
})
