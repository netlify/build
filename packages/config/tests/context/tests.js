const test = require('ava')

const { runFixture } = require('../helpers/main')

test('Context with context CLI flag', async t => {
  await runFixture(t, 'context_flag', { flags: { context: 'testContext' } })
})

test('Context environment variable', async t => {
  await runFixture(t, 'context_flag', { env: { CONTEXT: 'testContext' } })
})

test('Context default value', async t => {
  await runFixture(t, 'context_default')
})

test('Context with branch CLI flag', async t => {
  await runFixture(t, 'branch', { flags: { branch: 'testBranch' } })
})

test('Context with branch environment variable', async t => {
  await runFixture(t, 'branch', { env: { BRANCH: 'testBranch' }, flags: { branch: '' } })
})

test('Context with branch git', async t => {
  await runFixture(t, 'branch', { copyRoot: { branch: 'testBranch' }, flags: { branch: '' } })
})

test('Context with branch fallback', async t => {
  await runFixture(t, 'branch_fallback', { copyRoot: { git: false }, flags: { branch: '' } })
})

test('Context deep merge', async t => {
  await runFixture(t, 'deep_merge')
})

test('Context array merge', async t => {
  await runFixture(t, 'array_merge')
})

test('Context merge priority', async t => {
  await runFixture(t, 'priority_merge', { flags: { branch: 'testBranch' } })
})
