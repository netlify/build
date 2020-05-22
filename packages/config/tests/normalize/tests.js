const test = require('ava')

const { runFixture } = require('../helpers/main')

test('build.lifecycle', async t => {
  await runFixture(t, 'lifecycle')
})

test('build.lifecycle.onBuild combined with build.command', async t => {
  await runFixture(t, 'command_lifecycle')
})

test('build.command empty', async t => {
  await runFixture(t, 'command_empty')
})

test('plugins[*].config', async t => {
  await runFixture(t, 'config')
})
