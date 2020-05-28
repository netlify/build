const test = require('ava')

const { getJsonOpt } = require('../../../../config/tests/helpers/main')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Local plugins', async t => {
  await runFixture(t, 'local')
})

test('Local plugins directory', async t => {
  await runFixture(t, 'local_dir')
})

test('Local plugins absolute path', async t => {
  await runFixture(t, 'local_absolute')
})

test('Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('UI plugins', async t => {
  const defaultConfig = getJsonOpt({ plugins: [{ package: 'netlify-plugin-test' }] })
  await runFixture(t, 'ui', { flags: `--defaultConfig=${defaultConfig}` })
})

test('Resolution is relative to the build directory', async t => {
  await runFixture(t, 'basedir', { flags: `--config=${FIXTURES_DIR}/basedir/base/netlify.toml` })
})

test('Non-existing plugins', async t => {
  await runFixture(t, 'non_existing')
})

test('Do not allow overriding core plugins', async t => {
  await runFixture(t, 'core_override')
})

test('Can use plugins cached in the build image', async t => {
  await runFixture(t, 'build_image', {
    env: { TEST_BUILD_IMAGE_PLUGINS_DIR: `${FIXTURES_DIR}/build_image_cache/node_modules` },
    flags: '--mode=buildbot',
  })
})

test('Does not use plugins cached in the build image in local builds', async t => {
  await runFixture(t, 'build_image', {
    env: { TEST_BUILD_IMAGE_PLUGINS_DIR: `${FIXTURES_DIR}/build_image_cache/node_modules` },
  })
})
