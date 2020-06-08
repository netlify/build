const { platform } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Cache local', async t => {
  await runFixture(t, 'local', {
    flags: { testOpts: { cachePath: 'bower_components' } },
    env: { TEST_CACHE_PATH: 'bower_components' },
  })
})

// This works on Windows locally but not inside GitHub actions
// TODO: figure out why
if (platform !== 'win32') {
  test('Cache CI', async t => {
    await runFixture(t, 'ci', {
      flags: { testOpts: { cachePath: 'bower_components' }, mode: 'buildbot' },
      env: { TEST_CACHE_PATH: 'bower_components' },
    })
  })
}
