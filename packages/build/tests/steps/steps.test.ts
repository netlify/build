import { platform } from 'process'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

if (platform !== 'win32') {
  test('build.command uses Bash', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/bash').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test('build.command can execute shell commands', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/shell').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })
}

test('build.command can execute global binaries', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/global_bin').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.command can execute local binaries', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/local_bin').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.command use correct PWD', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/pwd').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.command from UI settings', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/none')
    .withFlags({ defaultConfig: { build: { command: 'node --version' } } })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Invalid package.json does not make build fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/invalid_package_json').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
