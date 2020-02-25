const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('onSuccess on success', async t => {
  await runFixture(t, 'on_success_success')
})

test('onSuccess on failure', async t => {
  await runFixture(t, 'on_success_failure')
})

test('onError on success', async t => {
  await runFixture(t, 'on_error_success')
})

test('onError lifecycle', async t => {
  await runFixture(t, 'on_error_lifecycle')
})

test('onError plugin event handler', async t => {
  await runFixture(t, 'on_error_plugin')
})

test('onError several', async t => {
  await runFixture(t, 'on_error_several')
})

test('onEnd on success', async t => {
  await runFixture(t, 'on_end_success')
})

test('onEnd on failure', async t => {
  await runFixture(t, 'on_end_failure')
})

test('onEnd + onError success', async t => {
  await runFixture(t, 'on_end_on_error_success')
})

test('onEnd + onError failure', async t => {
  await runFixture(t, 'on_end_on_error_failure')
})

test('onEnd several', async t => {
  await runFixture(t, 'on_end_several')
})

test('numbering', async t => {
  await runFixture(t, 'numbering')
})
