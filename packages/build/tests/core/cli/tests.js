const test = require('ava')

const { version } = require('../../../package.json')
const { runFixture } = require('../../helpers/main')

test('--help', async t => {
  await runFixture(t, '', { flags: { help: true }, useBinary: true })
})

test('--version', async t => {
  const { returnValue } = await runFixture(t, '', { flags: { version: true }, useBinary: true })
  t.is(returnValue, version)
})

test('Exit code is 0 on success', async t => {
  const { failed } = await runFixture(t, 'empty', { useBinary: true })
  t.not(failed)
})

test('Exit code is 1 on error', async t => {
  const { failed } = await runFixture(t, '', { flags: { config: '/invalid' }, useBinary: true })
  t.true(failed)
})
