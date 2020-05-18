const test = require('ava')

const { runWithApiMock } = require('../helpers/run')

test('utils.status.show() can override a success status', async t => {
  await runWithApiMock(t, 'success_status_override')
})

test('utils.status.show() cannot override an error status with a success status', async t => {
  await runWithApiMock(t, 'error_status_override')
})

test('utils.status.show() can override an error status with another error status', async t => {
  await runWithApiMock(t, 'error_status_error_override')
})

test('utils.status.show() implicit status is not used when an explicit call was made', async t => {
  await runWithApiMock(t, 'no_implicit')
})

test('utils.status.show() implicit status is not used when there are no events', async t => {
  await runWithApiMock(t, 'no_implicit_none')
})

test('utils.status.show() implicit status is not used when plugin did not complete', async t => {
  await runWithApiMock(t, 'no_implicit_incomplete')
})

test('utils.status.show() implicit status is not used when no call was made, with only onError', async t => {
  await runWithApiMock(t, 'no_implicit_onerror')
})

test('utils.status.show() implicit status is used when no call was made', async t => {
  await runWithApiMock(t, 'implicit_one')
})

test('utils.status.show() implicit status is used when no events have made a call', async t => {
  await runWithApiMock(t, 'implicit_several')
})

test('utils.status.show() implicit status is used when no call was made, with only onEnd', async t => {
  await runWithApiMock(t, 'implicit_onend')
})
