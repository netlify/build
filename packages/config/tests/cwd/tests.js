'use strict'

const { relative } = require('path')
const { cwd } = require('process')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('--cwd with no config', async (t) => {
  await runFixture(t, '', { flags: { cwd: `${FIXTURES_DIR}/empty`, defaultConfig: { build: { publish: '/' } } } })
})

test('--cwd with a relative path config', async (t) => {
  await runFixture(t, '', {
    flags: { cwd: relative(cwd(), FIXTURES_DIR), config: 'relative_cwd/netlify.toml' },
  })
})

test('build.base current directory', async (t) => {
  await runFixture(t, 'build_base_cwd')
})

test('build.base override', async (t) => {
  await runFixture(t, 'build_base_override', { flags: { cwd: `${FIXTURES_DIR}/build_base_override/subdir` } })
})

test('--repository-root', async (t) => {
  await runFixture(t, '', { flags: { repositoryRoot: `${FIXTURES_DIR}/empty` } })
})

test('--repository-root with cwd', async (t) => {
  await runFixture(t, '', { flags: { repositoryRoot: 'empty' }, cwd: FIXTURES_DIR, useBinary: true })
})

test('No .git', async (t) => {
  await runFixture(t, 'empty', { copyRoot: { cwd: true, git: false } })
})

test('--cwd non-existing', async (t) => {
  await runFixture(t, '', { flags: { cwd: '/invalid', repositoryRoot: `${FIXTURES_DIR}/empty` } })
})

test('--cwd points to a non-directory file', async (t) => {
  await runFixture(t, '', {
    flags: { cwd: `${FIXTURES_DIR}/empty/netlify.toml`, repositoryRoot: `${FIXTURES_DIR}/empty` },
  })
})

test('--repositoryRoot non-existing', async (t) => {
  await runFixture(t, '', { flags: { repositoryRoot: '/invalid' } })
})

test('--repositoryRoot points to a non-directory file', async (t) => {
  await runFixture(t, '', { flags: { repositoryRoot: `${FIXTURES_DIR}/empty/netlify.toml` } })
})

test('should detect base directory using package.json in sub dir', async (t) => {
  await runFixture(t, 'build_base_package_json', { flags: { cwd: `${FIXTURES_DIR}/build_base_package_json/subdir` } })
})
