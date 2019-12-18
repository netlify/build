const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('exec-utils defined', async t => {
  await runFixture(t, 'defined')
})

test('exec-utils local binaries', async t => {
  await runFixture(t, 'local')
})

test('exec-utils no arguments', async t => {
  await runFixture(t, 'no_args')
})

test('exec-utils no arguments but options', async t => {
  await runFixture(t, 'no_args_options')
})

test('exec-utils stdio', async t => {
  await runFixture(t, 'stdio')
})

test('exec-utils stdout', async t => {
  await runFixture(t, 'stdout')
})

test('exec-utils stderr', async t => {
  await runFixture(t, 'stderr')
})

test('exec-utils command', async t => {
  await runFixture(t, 'command')
})
