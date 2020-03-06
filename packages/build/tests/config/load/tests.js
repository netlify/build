const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')

const { runFixture, FIXTURES_DIR, removeDir, createRepoDir } = require('../../helpers/main')

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
