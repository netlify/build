const test = require('ava')

const { runFixture: runFixtureConfig, escapeExecaOpt } = require('../../../../config/tests/helpers/main')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('--cwd', async t => {
  await runFixture(t, '', { flags: `--cwd=${FIXTURES_DIR}/empty` })
})

test('--repository-root', async t => {
  await runFixture(t, '', { flags: `--repository-root=${FIXTURES_DIR}/empty` })
})

test('--config', async t => {
  await runFixture(t, '', { flags: `--config=${FIXTURES_DIR}/empty/netlify.toml` })
})

test('--defaultConfig', async t => {
  const defaultConfig = escapeExecaOpt(JSON.stringify({ build: { command: 'echo commandDefault' } }))
  await runFixture(t, 'empty', { flags: `--defaultConfig=${defaultConfig}` })
})

test('--cachedConfig', async t => {
  const { returnValue } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
  const cachedConfig = escapeExecaOpt(returnValue)
  await runFixture(t, 'cached_config', { flags: `--cachedConfig=${cachedConfig}` })
})

test('--context', async t => {
  await runFixture(t, 'context', { flags: '--context=testContext' })
})

test('--branch', async t => {
  await runFixture(t, 'context', { flags: '--branch=testContext' })
})

test('--baseRelDir', async t => {
  await runFixtureConfig(t, 'basereldir', { flags: `--no-baseRelDir` })
})

test('User error', async t => {
  await runFixture(t, '', { flags: `--config=/invalid` })
})

test('No configuration file', async t => {
  await runFixture(t, 'none')
})
