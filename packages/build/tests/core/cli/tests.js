const test = require('ava')

const { version } = require('../../../package.json')
const { runFixture } = require('../../helpers/main')

test('--help', async t => {
  await runFixture(t, '', { flags: '--help' })
})

test('--version', async t => {
  const { all } = await runFixture(t, '', { flags: '--version' })
  t.is(all, version)
})

test('Exit code is 0 on success', async t => {
  const { exitCode } = await runFixture(t, 'empty')
  t.is(exitCode, 0)
})

test('Exit code is 1 on error', async t => {
  const { exitCode } = await runFixture(t, '', { flags: '--config=/invalid' })
  t.is(exitCode, 1)
})

test('--features', async t => {
  await runFixture(t, '', { flags: '--features' })
})
