const test = require('ava')

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

test('Local plugins invalid path', async t => {
  await runFixture(t, 'local_invalid')
})

test('Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('UI plugins', async t => {
  const defaultConfig = JSON.stringify({ plugins: [{ package: 'netlify-plugin-test' }] })
  await runFixture(t, 'ui', { flags: { defaultConfig } })
})

test('Resolution is relative to the build directory', async t => {
  await runFixture(t, 'basedir', { flags: { config: `${FIXTURES_DIR}/basedir/base/netlify.toml` } })
})

test('Non-existing plugins', async t => {
  await runFixture(t, 'non_existing')
})

test('Do not allow overriding core plugins', async t => {
  await runFixture(t, 'core_override')
})

test('Can use plugins cached in the build image', async t => {
  await runFixture(t, 'build_image', {
    flags: { testOpts: { buildImagePluginsDir: `${FIXTURES_DIR}/build_image_cache/node_modules` }, mode: 'buildbot' },
  })
})

test('Does not use plugins cached in the build image in local builds', async t => {
  await runFixture(t, 'build_image', {
    flags: { testOpts: { buildImagePluginsDir: `${FIXTURES_DIR}/build_image_cache/node_modules` } },
  })
})
