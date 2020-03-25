const test = require('ava')

const { runFixtureConfig, getJsonOpt } = require('../helpers/main')

test('Base from defaultConfig', async t => {
  const defaultConfig = getJsonOpt({ build: { base: 'base' } })
  await runFixtureConfig(t, 'default_config', { flags: `--defaultConfig=${defaultConfig}` })
})

test('Base from configuration file property', async t => {
  const { stdout } = await runFixtureConfig(t, 'prop_config')
  const {
    buildDir,
    config: {
      build: { base, functions, publish },
    },
  } = JSON.parse(stdout)
  t.is(base, buildDir)
  t.true(functions.startsWith(buildDir))
  t.true(publish.startsWith(buildDir))
})

test('Base logic is not recursive', async t => {
  await runFixtureConfig(t, 'recursive')
})

test('BaseRelDir feature flag', async t => {
  const { stdout } = await runFixtureConfig(t, 'prop_config', { flags: `--no-baseRelDir` })
  const {
    buildDir,
    config: {
      build: { base, functions, publish },
    },
  } = JSON.parse(stdout)
  t.is(base, buildDir)
  t.false(functions.startsWith(buildDir))
  t.false(publish.startsWith(buildDir))
})
