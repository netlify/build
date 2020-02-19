const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('--token', async t => {
  await runFixture(t, 'token', { flags: '--token=test' })
})

test('feature flag', async t => {
  await runFixture(t, 'feature_flag')
})

test('scopes but no token', async t => {
  await runFixture(t, 'no_token', { flags: '--token=', env: { NETLIFY_BUILD_API_CLIENT: '1' } })
})

test('api call', async t => {
  await runFixture(t, 'api_call', {
    flags: '--token=test',
    env: { NETLIFY_BUILD_API_CLIENT: '1' },
  })
})

test('wrong scopes', async t => {
  await runFixture(t, 'wrong_scopes', {
    flags: '--token=test',
    env: { NETLIFY_BUILD_API_CLIENT: '1' },
  })
})

test('star scopes', async t => {
  await runFixture(t, 'star_scopes', {
    flags: '--token=test',
    env: { NETLIFY_BUILD_API_CLIENT: '1' },
  })
})

test('default scopes', async t => {
  await runFixture(t, 'default_scopes', {
    flags: '--token=test',
    env: { NETLIFY_BUILD_API_CLIENT: '1' },
  })
})

test('--site-id', async t => {
  await runFixture(t, 'site_id', { flags: '--site-id=test' })
})
