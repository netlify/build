const test = require('ava')

const { runFixture } = require('../../helpers/main')

test.skip('Redact secrets in build.lifecycle', async t => {
  await runFixture(t, 'lifecycle', { env: { SECRET_ENV_VAR: 'apiKey' } })
})

test.skip('Redact secrets in plugins', async t => {
  await runFixture(t, 'plugin', { env: { SECRET_ENV_VAR: 'apiKey' } })
})
