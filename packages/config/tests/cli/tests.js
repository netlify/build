const test = require('ava')

const { runFixture } = require('../helpers/main')

test('--help', async t => {
  await runFixture(t, '', { flags: '--help' })
})

test('--version', async t => {
  await runFixture(t, '', { flags: '--version' })
})

test('Success', async t => {
  await runFixture(t, 'empty')
})

test('User error', async t => {
  await runFixture(t, 'empty', { flags: '--config=/invalid' })
})

test('CLI flags', async t => {
  await runFixture(t, 'empty', { flags: '--branch=test' })
})

test('Stabilitize output with the --stable flag', async t => {
  await runFixture(t, 'empty', { flags: '--stable' })
})

test('Does not stabilitize output without the --stable flag', async t => {
  await runFixture(t, 'empty', { flags: '--no-stable' })
})
