const test = require('ava')

const { runFixture } = require('../helpers/main')

test('Prints some information in debug mode', async t => {
  await runFixture(t, 'simple', { flags: { debug: true }, useBinary: true })
})

test('Does not print confidential information in debug mode', async t => {
  const defaultConfig = JSON.stringify({ build: { environment: { SECRET: 'true' } } })
  await runFixture(t, 'simple', { flags: { debug: true, defaultConfig, env: { SECRET: 'true' } }, useBinary: true })
})
