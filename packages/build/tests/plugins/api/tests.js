const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('--token', async t => {
  await runFixture(t, 'token', { flags: '--token=test' })
})

test('scopes but no token', async t => {
  await runFixture(t, 'no_token')
})

test('api call', async t => {
  await runFixture(t, 'api_call', { flags: '--token=test' })
})

test('wrong scopes', async t => {
  await runFixture(t, 'wrong_scopes', { flags: '--token=test' })
})

test('star scopes', async t => {
  await runFixture(t, 'star_scopes', { flags: '--token=test' })
})

test('default scopes', async t => {
  await runFixture(t, 'default_scopes', { flags: '--token=test' })
})
