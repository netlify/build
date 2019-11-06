const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Print stack trace of plugin errors', async t => {
  await runFixture(t, 'plugin')
})

test('Print stack trace of plugin errors during load', async t => {
  await runFixture(t, 'plugin_load')
})

test('Print stack trace of lifecycle command errors', async t => {
  await runFixture(t, 'lifecycle')
})

test('Print stack trace of lifecycle command errors with stack traces', async t => {
  await runFixture(t, 'lifecycle_stack')
})

test('Print stack trace of validation errors', async t => {
  await runFixture(t, 'invalid')
})

test('Process errors: uncaughtException', async t => {
  await runFixture(t, 'uncaught')
})

test('Process errors: unhandledRejection', async t => {
  await runFixture(t, 'unhandled_rejection')
})

test('Exits in plugins', async t => {
  await runFixture(t, 'plugin_exit')
})
