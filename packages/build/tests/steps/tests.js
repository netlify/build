import { platform } from 'process'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

if (platform !== 'win32') {
  test('build.command uses Bash', async (t) => {
    const output = await new Fixture(test.meta.file, './fixtures/bash').runWithBuild()
    t.snapshot(normalizeOutput(output))
  })

  test('build.command can execute shell commands', async (t) => {
    const output = await new Fixture(test.meta.file, './fixtures/shell').runWithBuild()
    t.snapshot(normalizeOutput(output))
  })
}

test('build.command can execute global binaries', async (t) => {
  const output = await new Fixture(test.meta.file, './fixtures/global_bin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.command can execute local binaries', async (t) => {
  const output = await new Fixture(test.meta.file, './fixtures/local_bin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.command use correct PWD', async (t) => {
  const output = await new Fixture(test.meta.file, './fixtures/pwd').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.command from UI settings', async (t) => {
  const output = await new Fixture(test.meta.file, './fixtures/none')
    .withFlags({ defaultConfig: { build: { command: 'node --version' } } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Invalid package.json does not make build fail', async (t) => {
  const output = await new Fixture(test.meta.file, './fixtures/invalid_package_json').runWithBuild()
  t.snapshot(normalizeOutput(output))
})
