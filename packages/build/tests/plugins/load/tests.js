const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Can use local plugins', async t => {
  await runFixture(t, 'local')
})

test('Can use Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('Reports missing plugins', async t => {
  await runFixture(t, 'missing')
})

test('Plugin.id is optional', async t => {
  await runFixture(t, 'optional_id')
})

test('Can override plugins', async t => {
  await runFixture(t, 'override')
})

test('Handles top-level errors', async t => {
  await runFixture(t, 'error_top')
})

test('Handles top function errors', async t => {
  await runFixture(t, 'error_function')
})

test('Handles process warnings', async t => {
  await runFixture(t, 'error_warning')
})

test('Unhandled promises', async t => {
  await runFixture(t, 'error_promise')
})
