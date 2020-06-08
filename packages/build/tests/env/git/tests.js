const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Environment variable git', async t => {
  await runFixture(t, 'git')
})

test('Environment variable git with --branch', async t => {
  await runFixture(t, 'git_branch', { flags: { branch: 'test' } })
})

test('Environment variable git no repository', async t => {
  await runFixture(t, 'git', { copyRoot: { git: false } })
})
