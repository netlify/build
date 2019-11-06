const test = require('ava')

const { runFixture } = require('./helpers/main')

test('build.command + build.lifecycle', async t => {
  await runFixture(t, 'config_validate_old_command')
})

test('Old config.plugins syntax', async t => {
  await runFixture(t, 'config_validate_old_plugins')
})
