const test = require('ava')

const { runFixtureConfig } = require('../helpers/main')

test('Multiline commands', async t => {
  await runFixtureConfig(t, 'multiline')
})

test('build.command', async t => {
  await runFixtureConfig(t, 'command')
})

test('build.command and build.lifecycle.onbuild', async t => {
  await runFixtureConfig(t, 'command_lifecycle')
})

test('build.lifecycle.build', async t => {
  await runFixtureConfig(t, 'old_lifecycle')
})

test('build.lifecycle.onbuild case', async t => {
  await runFixtureConfig(t, 'case')
})

test('build.lifecycle.prebuild case', async t => {
  await runFixtureConfig(t, 'old_case')
})

test('build.lifecycle.finally', async t => {
  await runFixtureConfig(t, 'finally')
})

test('plugins[*].type', async t => {
  await runFixtureConfig(t, 'type')
})

test('plugins[*].config', async t => {
  await runFixtureConfig(t, 'config')
})
