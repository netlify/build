const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('--token', async t => {
  await runFixture(t, 'token', { flags: '--token=test' })
})

test('NETLIFY_AUTH_TOKEN environment variable', async t => {
  await runFixture(t, 'api_call', { flags: '--test-opts.api-client', env: { NETLIFY_AUTH_TOKEN: 'test' } })
})

test('feature flag', async t => {
  await runFixture(t, 'feature_flag')
})

test('scopes but no token', async t => {
  await runFixture(t, 'no_token', { flags: '--test-opts.api-client', env: { NETLIFY_AUTH_TOKEN: '' } })
})

test('api call', async t => {
  await runFixture(t, 'api_call', { flags: '--token=test --test-opts.api-client' })
})

test('wrong scopes', async t => {
  await runFixture(t, 'wrong_scopes', { flags: '--token=test --test-opts.api-client' })
})

test('star scopes', async t => {
  await runFixture(t, 'star_scopes', { flags: '--token=test --test-opts.api-client' })
})

test('default scopes', async t => {
  await runFixture(t, 'default_scopes', { flags: '--token=test --test-opts.api-client' })
})

test('--site-id', async t => {
  await runFixture(t, 'site_id', { flags: '--site-id=test' })
})
