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
