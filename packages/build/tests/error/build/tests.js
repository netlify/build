const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('build.fail()', async t => {
  await runFixture(t, 'fail')
})

test('build.fail() error option', async t => {
  await runFixture(t, 'fail_error_option')
})

test('build.cancel()', async t => {
  await runFixture(t, 'cancel')
})

test('build.cancel() error option', async t => {
  await runFixture(t, 'cancel_error_option')
})

test('exception', async t => {
  await runFixture(t, 'exception')
})

test('exception with static properties', async t => {
  await runFixture(t, 'exception_props')
})
