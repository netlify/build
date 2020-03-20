const test = require('ava')

const { runFixtureConfig } = require('../helpers/main')

test('Context with context CLI flag', async t => {
  await runFixtureConfig(t, 'context_flag', { flags: '--context=testContext' })
})

test('Context environment variable', async t => {
  await runFixtureConfig(t, 'context_flag', { env: { CONTEXT: 'testContext' } })
})

test('Context default value', async t => {
  await runFixtureConfig(t, 'context_default')
})

test('Context with branch CLI flag', async t => {
  await runFixtureConfig(t, 'branch', { flags: '--branch=testBranch' })
})

test('Context with branch environment variable', async t => {
  await runFixtureConfig(t, 'branch', { env: { BRANCH: 'testBranch' } })
})

test('Context with branch git', async t => {
  await runFixtureConfig(t, 'branch', { copyRoot: { branch: 'testBranch' }, env: { BRANCH: '' } })
})

test('Context with branch fallback', async t => {
  await runFixtureConfig(t, 'branch_fallback', { copyRoot: { git: false }, env: { BRANCH: '' } })
})

test('Context deep merge', async t => {
  await runFixtureConfig(t, 'deep_merge')
})

test('Context array merge', async t => {
  await runFixtureConfig(t, 'array_merge')
})

test('Context merge priority', async t => {
  await runFixtureConfig(t, 'priority_merge', { flags: '--branch=testBranch' })
})
