const test = require('ava')

const { escapeExecaOpt } = require('../../../../config/tests/helpers/main')
const { runFixture } = require('../../helpers/main')

test('Print stack trace of plugin errors', async t => {
  await runFixture(t, 'plugin')
})

test('Print stack trace of plugin errors during load', async t => {
  await runFixture(t, 'plugin_load')
})

test('Print stack trace of build.command errors', async t => {
  await runFixture(t, 'command')
})

test('Print stack trace of build.command errors with stack traces', async t => {
  await runFixture(t, 'command_stack')
})

test('Print stack trace of Build command UI settings', async t => {
  const defaultConfig = escapeExecaOpt(JSON.stringify({ build: { command: 'node --invalid' } }))
  await runFixture(t, 'none', { flags: `--defaultConfig=${defaultConfig}` })
})

test('Print stack trace of validation errors', async t => {
  await runFixture(t, '', { flags: '--config=/invalid' })
})
