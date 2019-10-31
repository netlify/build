const test = require('ava')

const { runFixture } = require('./helpers/main')

test('Print stack trace of plugin errors', async t => {
  await runFixture(t, 'error_plugin')
})

test('Print stack trace of plugin errors during load', async t => {
  await runFixture(t, 'error_plugin_load')
})

test('Print stack trace of lifecycle command errors', async t => {
  await runFixture(t, 'error_lifecycle')
})

test('Print stack trace of lifecycle command errors with stack traces', async t => {
  await runFixture(t, 'error_lifecycle_stack')
})

test('Print stack trace of validation errors', async t => {
  await runFixture(t, 'invalid')
})

test('Process errors: uncaughtException', async t => {
  await runFixture(t, 'process_error_uncaught')
})

test('Process errors: unhandledRejection', async t => {
  await runFixture(t, 'process_error_unhandled_rejection')
})

test('Process errors: warning', async t => {
  await runFixture(t, 'process_error_warning')
})
