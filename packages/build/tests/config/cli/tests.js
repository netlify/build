const test = require('ava')

const { runFixtureConfig } = require('../../helpers/main')

test('--help', async t => {
  await runFixtureConfig(t, '', { flags: '--help' })
})

test('--version', async t => {
  await runFixtureConfig(t, '', { flags: '--version' })
})

test('Success', async t => {
  await runFixtureConfig(t, 'empty')
})

test('User error', async t => {
  await runFixtureConfig(t, 'empty', { flags: '--config=/invalid' })
})

test('CLI flags', async t => {
  await runFixtureConfig(t, 'empty', { flags: '--branch=test' })
})
