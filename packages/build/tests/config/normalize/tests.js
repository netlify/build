const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('prebuild instead of preBuild', async t => {
  await runFixture(t, 'case')
})

test('Multiline commands', async t => {
  await runFixture(t, 'multiline')
})

test('Array commands', async t => {
  await runFixture(t, 'array')
})

test('build.command', async t => {
  await runFixture(t, 'command')
})
