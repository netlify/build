import { relative } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('--cwd with no config', async () => {
  const output = await new Fixture()
    .withFlags({ cwd: `${FIXTURES_DIR}/empty`, defaultConfig: { build: { publish: '/' } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cwd with a relative path config', async () => {
  const output = await new Fixture()
    .withFlags({ cwd: relative(cwd(), FIXTURES_DIR), config: 'relative_cwd/netlify.toml' })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.base current directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_base_cwd').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('build.base override', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_base_override')
    .withFlags({ cwd: `${FIXTURES_DIR}/build_base_override/subdir` })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--repository-root', async () => {
  const output = await new Fixture().withFlags({ repositoryRoot: `${FIXTURES_DIR}/empty` }).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--repository-root with cwd', async () => {
  const { output } = await new Fixture().withFlags({ repositoryRoot: 'empty' }).runConfigBinary(FIXTURES_DIR)
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('No .git', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withCopyRoot({ git: false, cwd: true })
    .then((fixture) => fixture.runWithConfig())
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cwd non-existing', async () => {
  const output = await new Fixture()
    .withFlags({ cwd: '/invalid', repositoryRoot: `${FIXTURES_DIR}/empty` })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cwd points to a non-directory file', async () => {
  const output = await new Fixture()
    .withFlags({ cwd: `${FIXTURES_DIR}/empty/netlify.toml`, repositoryRoot: `${FIXTURES_DIR}/empty` })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--repositoryRoot non-existing', async () => {
  const output = await new Fixture().withFlags({ repositoryRoot: '/invalid' }).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--repositoryRoot points to a non-directory file', async () => {
  const output = await new Fixture().withFlags({ repositoryRoot: `${FIXTURES_DIR}/empty/netlify.toml` }).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('should detect base directory using package.json in sub dir', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_base_package_json')
    .withFlags({ cwd: `${FIXTURES_DIR}/build_base_package_json/subdir` })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
