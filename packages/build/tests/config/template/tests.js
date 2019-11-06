const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('{env:...}', async t => {
  await runFixture(t, 'env', { env: { TEST: 'test' } })
})

test('{secrets:...}', async t => {
  await runFixture(t, 'secrets')
})

test('{context:...}', async t => {
  await runFixture(t, 'context')
})

test('{context:...} with --context', async t => {
  await runFixture(t, 'context', { flags: '--context development' })
})

test('{context:...} pointing to undefined path', async t => {
  await runFixture(t, 'context', { flags: '--context invalid' })
})
