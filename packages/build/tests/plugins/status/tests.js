const test = require('ava')

const { runFixture } = require('../../helpers/main')

const runUtilsStatusShow = function(t, argument) {
  return runFixture(t, 'main', { env: { SHOW_ARG: JSON.stringify(argument) } })
}

test('utils.status.show() does not fail', async t => {
  await runUtilsStatusShow(t, { title: 'title', summary: 'summary', text: 'text' })
})

test('utils.status.show() are printed locally', async t => {
  await runFixture(t, 'print')
})

test('utils.status.show() can override a success status', async t => {
  await runFixture(t, 'success_status_override')
})

test('utils.status.show() cannot override an error status with a success status', async t => {
  await runFixture(t, 'error_status_override')
})

test('utils.status.show() can override an error status with another error status', async t => {
  await runFixture(t, 'error_status_error_override')
})

test('utils.status.show() implicit status is not used when an explicit call was made', async t => {
  await runFixture(t, 'no_implicit')
})

test('utils.status.show() implicit status is not used when there are no events', async t => {
  await runFixture(t, 'no_implicit_none')
})

test('utils.status.show() implicit status is not used when no call was made, with only onError', async t => {
  await runFixture(t, 'no_implicit_onerror')
})

test('utils.status.show() implicit status is used when no call was made', async t => {
  await runFixture(t, 'implicit_one')
})

test('utils.status.show() implicit status is used when no events have made a call', async t => {
  await runFixture(t, 'implicit_several')
})

test('utils.status.show() implicit status is used when no call was made, with only onEnd', async t => {
  await runFixture(t, 'implicit_onend')
})

test('utils.status.show() argument should be defined', async t => {
  await runUtilsStatusShow(t, '')
})

test('utils.status.show() argument should be an object', async t => {
  await runUtilsStatusShow(t, 'summary')
})

test('utils.status.show() argument should not contain typos', async t => {
  await runUtilsStatusShow(t, { titles: 'title', summary: 'summary', text: 'text' })
})

test('utils.status.show() requires a summary', async t => {
  await runUtilsStatusShow(t, { title: 'title', text: 'text' })
})

test('utils.status.show() allow other fields to be optional', async t => {
  await runUtilsStatusShow(t, { summary: 'summary' })
})

test('utils.status.show() title should be a string', async t => {
  await runUtilsStatusShow(t, { title: true, summary: 'summary', text: 'text' })
})

test('utils.status.show() title should not be empty', async t => {
  await runUtilsStatusShow(t, { title: ' ', summary: 'summary', text: 'text' })
})

test('utils.status.show() summary should be a string', async t => {
  await runUtilsStatusShow(t, { title: 'title', summary: true, text: 'text' })
})

test('utils.status.show() summary should not be empty', async t => {
  await runUtilsStatusShow(t, { title: 'title', summary: ' ', text: 'text' })
})

test('utils.status.show() text should be a string', async t => {
  await runUtilsStatusShow(t, { title: 'title', summary: 'summary', text: true })
})

test('utils.status.show() text should not be empty', async t => {
  await runUtilsStatusShow(t, { title: 'title', summary: 'summary', text: ' ' })
})
