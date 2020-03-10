const test = require('ava')

const { runFixture, runFixtureConfig, FIXTURES_DIR } = require('../../helpers/main')

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
  await runFixture(t, 'default_config', { flags: `--defaultConfig=${FIXTURES_DIR}/default_config/default.yml` })
})

test('--cachedConfig', async t => {
  const { stdout } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
  const cachedConfig = stdout.replace(/ /g, '\\ ')
  await runFixture(t, 'cached_config', { flags: `--cachedConfig=${cachedConfig}` })
})

test('--context', async t => {
  await runFixture(t, 'context', { flags: '--context=testContext' })
})

test('--branch', async t => {
  await runFixture(t, 'context', { flags: '--branch=testContext' })
})

test('User error', async t => {
  await runFixture(t, '', { flags: `--config=/invalid` })
})
