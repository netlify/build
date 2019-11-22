const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('onError lifecycle', async t => {
  await runFixture(t, 'on_error_lifecycle')
})

test('onError plugin hook', async t => {
  await runFixture(t, 'on_error_plugin')
})

test('onError several', async t => {
  await runFixture(t, 'on_error_several')
})
