const test = require('ava')

const { runFixture } = require('./helpers/main')

test('prebuild instead of preBuild', async t => {
  await runFixture(t, 'config_normalize_case')
})

test('Multiline commands', async t => {
  await runFixture(t, 'config_normalize_multiline')
})

test('Array commands', async t => {
  await runFixture(t, 'config_normalize_array')
})

test('build.command', async t => {
  await runFixture(t, 'config_normalize_command')
})
