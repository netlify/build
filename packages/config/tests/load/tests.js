const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')

const resolveConfig = require('../..')
const { runFixtureConfig, FIXTURES_DIR, getJsonOpt, escapeExecaOpt } = require('../helpers/main')

test('Empty configuration', async t => {
  await runFixtureConfig(t, 'empty')
})

test('Can define configuration as environment variables', async t => {
  await runFixtureConfig(t, 'empty', {
    env: {
      NETLIFY_CONFIG_BUILD_LIFECYCLE_ONBUILD: 'echo onBuild',
      NETLIFY_CONFIG_BUILD_LIFECYCLE_ONPOSTBUILD: 'echo onPostBuild',
      NETLIFY_CONFIG_BUILD_PUBLISH: 'publish',
    },
  })
})

test('No --config but none found', async t => {
  await runFixtureConfig(t, 'none', { copyRoot: {} })
})

test('Several configuration files', async t => {
  await runFixtureConfig(t, 'several')
})

test('--config with an absolute path', async t => {
  await runFixtureConfig(t, '', { flags: `--config=${FIXTURES_DIR}/empty/netlify.yml` })
})

test('--config with a relative path', async t => {
  await runFixtureConfig(t, '', { flags: `--config=${relative(cwd(), FIXTURES_DIR)}/empty/netlify.yml` })
})

test('--config with an invalid relative path', async t => {
  await runFixtureConfig(t, '', { flags: '--config=/invalid' })
})

test('--defaultConfig merge', async t => {
  const defaultConfig = getJsonOpt({ build: { lifecycle: { onInit: 'echo onInit' } } })
  await runFixtureConfig(t, 'default_merge', { flags: `--defaultConfig=${defaultConfig}` })
})

test('--defaultConfig priority', async t => {
  const defaultConfig = getJsonOpt({ build: { lifecycle: { onBuild: 'echo onBuild' } } })
  await runFixtureConfig(t, 'default_priority', { flags: `--defaultConfig=${defaultConfig}` })
})

test('--defaultConfig with an invalid relative path', async t => {
  await runFixtureConfig(t, '', { flags: '--defaultConfig={{}' })
})

test('--cachedConfig', async t => {
  const { stdout } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
  const cachedConfig = escapeExecaOpt(stdout)
  await runFixtureConfig(t, 'cached_config', { flags: `--cachedConfig=${cachedConfig}` })
})

test('--cachedConfig with an invalid path', async t => {
  await runFixtureConfig(t, '', { flags: '--cachedConfig={{}' })
})

test('Programmatic', async t => {
  const { config } = await resolveConfig({ repositoryRoot: `${FIXTURES_DIR}/empty` })
  t.not(config.build.environment, undefined)
})

test('Programmatic no options', async t => {
  const { config } = await resolveConfig()
  t.not(config.build.environment, undefined)
})
