import { Fixture, normalizeOutput } from '@netlify/testing'
import * as colors from 'ansis'
import test from 'ava'
import hasAnsi from 'has-ansi'

test('Colors in parent process', async (t) => {
  const { output } = await new Fixture('./fixtures/parent')
    .withFlags({ dry: true })
    .withEnv({ FORCE_COLOR: '1' })
    .runBuildBinary()
  t.true(hasAnsi(output))
})

test('Colors in child process', async (t) => {
  const { output } = await new Fixture('./fixtures/child').withEnv({ FORCE_COLOR: '1' }).runBuildBinary()
  t.true(output.includes(colors.red('onPreBuild')))
})

test('Netlify CI', async (t) => {
  const { output } = await new Fixture('./fixtures/parent')
    .withFlags({ dry: true, mode: 'buildbot' })
    .withEnv({ FORCE_COLOR: '1' })
    .runBuildBinary()
  t.true(hasAnsi(output))
})

test('No TTY', async (t) => {
  const { output } = await new Fixture('./fixtures/parent')
    .withFlags({ dry: true })
    .withEnv({ FORCE_COLOR: '0' })
    .runBuildBinary()
  t.false(hasAnsi(output))
})

test('Logs whether the build commands came from the UI', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ defaultConfig: { build: { command: 'node --invalid' } } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('The verbose flag enables verbosity', async (t) => {
  const output = await new Fixture('./fixtures/verbose').withFlags({ verbose: true }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Verbosity works with plugin errors', async (t) => {
  const output = await new Fixture('./fixtures/verbose_error').withFlags({ verbose: true }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not truncate long headers in logs', async (t) => {
  const output = await new Fixture('./fixtures/truncate_headers').runWithBuild()
  t.false(output.includes('999'))
})

test('Does not truncate long redirects in logs', async (t) => {
  const output = await new Fixture('./fixtures/truncate_redirects').runWithBuild()
  t.false(output.includes('999'))
})
