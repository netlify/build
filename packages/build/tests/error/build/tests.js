const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('build.fail()', async t => {
  await runFixture(t, 'fail')
})

test('exception', async t => {
  await runFixture(t, 'exception')
})

test('exception with static properties', async t => {
  await runFixture(t, 'exception_props')
})
