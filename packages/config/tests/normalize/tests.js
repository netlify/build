const test = require('ava')

const { runFixture } = require('../helpers/main')

test('build.command empty', async t => {
  await runFixture(t, 'command_empty')
})

test('Some properties can be capitalized', async t => {
  await runFixture(t, 'props_case')
})

test('Some properties can be capitalized even when merged with defaultConfig', async t => {
  const defaultConfig = JSON.stringify({
    build: {
      base: 'baseDefault',
      command: 'gulp build default',
      functions: 'functionsDefault',
      edge_handlers: 'edgeHandlersDefault',
      ignore: 'doIgnoreDefault',
      publish: 'publishDefault',
      environment: { TEST: 'testDefault' },
      processing: { css: { bundle: false } },
    },
  })
  await runFixture(t, 'props_case', { flags: { defaultConfig } })
})

test('Some properties can be capitalized even when merged with contexts', async t => {
  await runFixture(t, 'props_case_context', { flags: { context: 'testContext', branch: 'testBranch' } })
})

test('Does not add build.commandOrigin config if there are none', async t => {
  await runFixture(t, 'empty')
})

test('Does not add build.commandOrigin config if command is empty', async t => {
  await runFixture(t, 'command_empty')
})

test('Add build.commandOrigin config if it came from netlify.toml', async t => {
  await runFixture(t, 'command_origin_config')
})

test('Add build.commandOrigin config if it came from contexts', async t => {
  await runFixture(t, 'command_origin_context')
})

test('Add build.commandOrigin ui if it came from defaultConfig', async t => {
  const defaultConfig = JSON.stringify({ build: { command: 'test' } })
  await runFixture(t, 'empty', { flags: { defaultConfig } })
})
