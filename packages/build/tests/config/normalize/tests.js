const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Multiline commands', async t => {
  await runFixture(t, 'multiline')
})

test('Array commands', async t => {
  await runFixture(t, 'array')
})

test('build.command', async t => {
  await runFixture(t, 'command')
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
