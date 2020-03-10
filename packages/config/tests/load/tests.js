const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')

const resolveConfig = require('../..')
const { runFixtureConfig, FIXTURES_DIR, createRepoDir, removeDir } = require('../helpers/main')

test('Empty configuration', async t => {
  await runFixtureConfig(t, 'empty')
})

test('Can define configuration as environment variables', async t => {
  await runFixtureConfig(t, 'empty', {
    env: {
      NETLIFY_CONFIG_BUILD_LIFECYCLE_ONBUILD: 'echo onBuild',
      NETLIFY_CONFIG_BUILD_LIFECYCLE_ONINSTALL: 'echo onInstall',
      NETLIFY_CONFIG_BUILD_PUBLISH: 'publish',
    },
  })
})

test('No --config but none found', async t => {
  const cwd = await createRepoDir()
  try {
    await runFixtureConfig(t, '', { cwd })
  } finally {
    await removeDir(cwd)
  }
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
  await runFixtureConfig(t, 'default_merge', { flags: `--defaultConfig=${FIXTURES_DIR}/default_merge/default.yml` })
})

test('--defaultConfig priority', async t => {
  await runFixtureConfig(t, 'default_priority', {
    flags: `--defaultConfig=${FIXTURES_DIR}/default_priority/default.yml`,
  })
})

test('--defaultConfig with an invalid relative path', async t => {
  await runFixtureConfig(t, '', { flags: '--defaultConfig=/invalid' })
})

test('--cachedConfig', async t => {
  const { stdout } = await runFixtureConfig(t, 'cached_config', { snapshot: false })
  const cachedConfig = stdout.replace(/ /g, '\\ ')
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
