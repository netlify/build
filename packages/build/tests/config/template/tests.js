const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('{env:...}', async t => {
  await runFixture(t, 'env', { env: { TEST: 'test' } })
})

test('{context:...}', async t => {
  await runFixture(t, 'context')
})

test('{context:...} with --context', async t => {
  await runFixture(t, 'context', { flags: '--context development' })
})

test('{context:...} with environment variable CONTEXT', async t => {
  await runFixture(t, 'context', { env: { CONTEXT: 'development' } })
})

test('{context:...} priority', async t => {
  await runFixture(t, 'context', { flags: '--context development', env: { CONTEXT: 'production' } })
})

test('{context:...} pointing to undefined path', async t => {
  await runFixture(t, 'context', { flags: '--context invalid' })
})

test('{opt:...}', async t => {
  await runFixture(t, 'opt', { flags: '--custom test' })
})
