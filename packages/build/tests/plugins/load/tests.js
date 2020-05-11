const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Local plugins', async t => {
  await runFixture(t, 'local')
})

test('Node module plugins', async t => {
  await runFixture(t, 'module')
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
