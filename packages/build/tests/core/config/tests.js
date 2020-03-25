const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { runFixture: runFixtureConfig, getJsonOpt, escapeExecaOpt } = require('../../../../config/tests/helpers/main')

test('--cwd', async t => {
  await runFixture(t, '', { flags: `--cwd=${FIXTURES_DIR}/empty` })
})

test('--repository-root', async t => {
  await runFixture(t, '', { flags: `--repository-root=${FIXTURES_DIR}/empty` })
})

test('--config', async t => {
  await runFixture(t, '', { flags: `--config=${FIXTURES_DIR}/empty/netlify.yml` })
})

test('--defaultConfig', async t => {
  const defaultConfig = getJsonOpt({ build: { lifecycle: { onInit: 'echo onInit' } } })
  await runFixture(t, 'default_config', { flags: `--defaultConfig=${defaultConfig}` })
})

test('--cachedConfig', async t => {
  const { stdout } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
  const cachedConfig = escapeExecaOpt(stdout)
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
