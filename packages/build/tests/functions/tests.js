import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

import test from 'ava'
import del from 'del'
import { pathExists } from 'path-exists'

import { removeDir } from '../helpers/dir.js'
import { runFixture } from '../helpers/main.js'
import { getTempName } from '../helpers/temp.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

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
  await fs.writeFile(packageJsonPath, '{{}')
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
    const files = await fs.readdir(functionsDistDir)
    // We're expecting two files: the function ZIP and the manifest.
    t.is(files.length, 2)
  } finally {
    await removeDir(functionsDistDir)
  }
})
