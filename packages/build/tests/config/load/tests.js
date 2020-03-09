const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')
const resolveConfig = require('@netlify/config')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { createRepoDir, removeDir } = require('../../helpers/dir')

test('Empty configuration', async t => {
  await runFixture(t, 'empty')
})

test('Can define configuration as environment variables', async t => {
  await runFixture(t, 'empty', {
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
    await runFixture(t, '', { cwd })
  } finally {
    await removeDir(cwd)
  }
})

test('--config with an absolute path', async t => {
  await runFixture(t, '', { flags: `--config=${FIXTURES_DIR}/empty/netlify.yml` })
})

test('--config with a relative path', async t => {
  await runFixture(t, '', { flags: `--config=${relative(cwd(), FIXTURES_DIR)}/empty/netlify.yml` })
})

test('--config with an invalid relative path', async t => {
  await runFixture(t, '', { flags: '--config=/invalid' })
})

test('--defaultConfig merge', async t => {
  await runFixture(t, 'default_merge', { flags: `--defaultConfig=${FIXTURES_DIR}/default_merge/default.yml` })
})

test('--defaultConfig priority', async t => {
  await runFixture(t, 'default_priority', { flags: `--defaultConfig=${FIXTURES_DIR}/default_priority/default.yml` })
})

test('--defaultConfig with an invalid relative path', async t => {
  await runFixture(t, '', { flags: '--defaultConfig=/invalid' })
})

test('--cachedConfig', async t => {
  const repositoryRoot = `${FIXTURES_DIR}/cached_config`
  const cachedConfig = await resolveConfig({ repositoryRoot })
  const cachedConfigString = JSON.stringify(cachedConfig).replace(/ /g, '\\ ')
  await runFixture(t, 'cached_config', { flags: `--cachedConfig=${cachedConfigString}` })
})

test('--cachedConfig with an invalid path', async t => {
  await runFixture(t, '', { flags: '--cachedConfig={{}' })
})
