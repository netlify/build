import { relative } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('--cwd with no config', async (t) => {
  const output = await new Fixture()
    .withFlags({ cwd: `${FIXTURES_DIR}/empty`, defaultConfig: { build: { publish: '/' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--cwd with a relative path config', async (t) => {
  const output = await new Fixture()
    .withFlags({ cwd: relative(cwd(), FIXTURES_DIR), config: 'relative_cwd/netlify.toml' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.base current directory', async (t) => {
  const output = await new Fixture('./fixtures/build_base_cwd').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('build.base override', async (t) => {
  const output = await new Fixture('./fixtures/build_base_override')
    .withFlags({ cwd: `${FIXTURES_DIR}/build_base_override/subdir` })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--repository-root', async (t) => {
  const output = await new Fixture().withFlags({ repositoryRoot: `${FIXTURES_DIR}/empty` }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--repository-root with cwd', async (t) => {
  const { output } = await new Fixture().withFlags({ repositoryRoot: 'empty' }).runConfigBinary(FIXTURES_DIR)
  t.snapshot(normalizeOutput(output))
})

test('No .git', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withCopyRoot({ git: false, cwd: true })
    .then((fixture) => fixture.runWithConfig())
  t.snapshot(normalizeOutput(output))
})

test('--cwd non-existing', async (t) => {
  const output = await new Fixture()
    .withFlags({ cwd: '/invalid', repositoryRoot: `${FIXTURES_DIR}/empty` })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--cwd points to a non-directory file', async (t) => {
  const output = await new Fixture()
    .withFlags({ cwd: `${FIXTURES_DIR}/empty/netlify.toml`, repositoryRoot: `${FIXTURES_DIR}/empty` })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--repositoryRoot non-existing', async (t) => {
  const output = await new Fixture().withFlags({ repositoryRoot: '/invalid' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--repositoryRoot points to a non-directory file', async (t) => {
  const output = await new Fixture().withFlags({ repositoryRoot: `${FIXTURES_DIR}/empty/netlify.toml` }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('should detect base directory using package.json in sub dir', async (t) => {
  const output = await new Fixture('./fixtures/build_base_package_json')
    .withFlags({ cwd: `${FIXTURES_DIR}/build_base_package_json/subdir` })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})
