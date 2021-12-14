'use strict'

const { writeFile, readdir } = require('fs')
const { promisify } = require('util')

const test = require('ava')
const del = require('del')
const pathExists = require('path-exists')

const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')
const { getTempName } = require('../helpers/temp')

const pWriteFile = promisify(writeFile)
const pReaddir = promisify(readdir)

test('Functions: missing source directory', async (t) => {
  await runFixture(t, 'missing')
})

test('Functions: must not be a regular file', async (t) => {
  await runFixture(t, 'regular_file')
})

test('Functions: can be a symbolic link', async (t) => {
  await runFixture(t, 'symlink')
})

test('Functions: default directory', async (t) => {
  await runFixture(t, 'default')
})

test('Functions: simple setup', async (t) => {
  await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  await runFixture(t, 'simple')
})

test('Functions: no functions', async (t) => {
  await runFixture(t, 'none')
})

test('Functions: invalid package.json', async (t) => {
  const fixtureName = 'functions_package_json_invalid'
  const packageJsonPath = `${FIXTURES_DIR}/${fixtureName}/package.json`
  // We need to create that file during tests. Otherwise, ESLint fails when
  // detecting an invalid *.json file.
  await pWriteFile(packageJsonPath, '{{}')
  try {
    await runFixture(t, fixtureName)
  } finally {
    await del(packageJsonPath)
  }
})

test('Functions: --functionsDistDir', async (t) => {
  const functionsDistDir = await getTempName()
  try {
    await runFixture(t, 'simple', { flags: { mode: 'buildbot', functionsDistDir } })
    t.true(await pathExists(functionsDistDir))
    const files = await pReaddir(functionsDistDir)
    t.is(files.length, 1)
  } finally {
    await removeDir(functionsDistDir)
  }
})
