const { cwd, platform } = require('process')
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

test('No --config', async t => {
  await runFixture(t, '', { config: false, cwd: `${FIXTURES_DIR}/empty` })
})

test('No --config but none found', async t => {
  const cwd = await createRepoDir()
  try {
    await runFixture(t, '', { config: false, cwd })
  } finally {
    await removeDir(cwd)
  }
})

test('No --config but none found and with environment variables', async t => {
  const cwd = await createRepoDir()
  try {
    await runFixture(t, '', {
      config: false,
      cwd,
      env: { NETLIFY_CONFIG_BUILD_LIFECYCLE_ONBUILD: 'echo onBuild' },
    })
  } finally {
    await removeDir(cwd)
  }
})

test('--config and environment variables', async t => {
  await runFixture(t, 'envvar', {
    env: { NETLIFY_CONFIG_BUILD_LIFECYCLE_ONBUILD: 'echo onBuild' },
  })
})

// Windows permissions system is different
if (platform !== 'win32') {
  test('--config with a directory without permissions', async t => {
    await runFixture(t, 'empty', { config: false, cwd: '/' })
  })
}

test('--config with an absolute path', async t => {
  await runFixture(t, 'empty')
})

test('--config with a relative path', async t => {
  await runFixture(t, '', { config: `${relative(cwd(), FIXTURES_DIR)}/empty/netlify.yml` })
})

test('--config with an invalid relative path', async t => {
  await runFixture(t, 'invalid')
})

test('--config with a Node module', async t => {
  await runFixture(t, '', { config: 'netlify-config-test', cwd: `${FIXTURES_DIR}/module` })
})

test('--config with an invalid Node module', async t => {
  await runFixture(t, '', { config: 'invalid', cwd: `${FIXTURES_DIR}/module` })
})

test('--config with a scoped Node module', async t => {
  await runFixture(t, '', { config: '@netlify/config-test', cwd: `${FIXTURES_DIR}/module` })
})

test('--config with an invalid scoped Node module', async t => {
  await runFixture(t, '', { config: '@netlify/invalid', cwd: `${FIXTURES_DIR}/module` })
})
