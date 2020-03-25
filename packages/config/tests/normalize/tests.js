const test = require('ava')

const { runFixture } = require('../helpers/main')

test('Multiline commands', async t => {
  await runFixture(t, 'multiline')
})

test('build.command', async t => {
  await runFixture(t, 'command')
})

test('build.command and build.lifecycle.onbuild', async t => {
  await runFixture(t, 'command_lifecycle')
})

test('build.lifecycle.build', async t => {
  await runFixture(t, 'old_lifecycle')
})

test('build.lifecycle.onbuild case', async t => {
  await runFixture(t, 'case')
})

test('build.lifecycle.prebuild case', async t => {
  await runFixture(t, 'old_case')
})

test('build.lifecycle.finally', async t => {
  await runFixture(t, 'finally')
})

test('build.lifecycle empty', async t => {
  await runFixture(t, 'lifecycle_empty')
})

test('plugins[*].type', async t => {
  await runFixture(t, 'type')
})

test('plugins[*].config', async t => {
  await runFixture(t, 'config')
})
