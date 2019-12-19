const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('run-utils defined', async t => {
  await runFixture(t, 'defined')
})

test('run-utils local binaries', async t => {
  await runFixture(t, 'local')
})

test('run-utils no arguments', async t => {
  await runFixture(t, 'no_args')
})

test('run-utils no arguments but options', async t => {
  await runFixture(t, 'no_args_options')
})

test('run-utils stdio', async t => {
  await runFixture(t, 'stdio')
})

test('run-utils stdout', async t => {
  await runFixture(t, 'stdout')
})

test('run-utils stderr', async t => {
  await runFixture(t, 'stderr')
})

test('run-utils command', async t => {
  await runFixture(t, 'command')
})
