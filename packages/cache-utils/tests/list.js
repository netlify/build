import process from 'process'

import test from 'ava'

import { list, save } from '../lib/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should allow listing cached files', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.deepEqual(await list({ cacheDir }), [])
    t.true(await save(srcFile, { cacheDir }))
    const files = await list({ cacheDir })
    t.is(files.length, 2)
    t.true(files.every((file) => srcFile.replace(/^[a-zA-Z]:\\/, '\\').startsWith(file)))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow changing the listing depth', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.deepEqual(await list({ cacheDir }), [])
    t.true(await save(srcFile, { cacheDir }))
    const files = await list({ cacheDir, depth: 0 })
    t.is(files.length, 1)
    t.true(files.every((file) => srcFile.replace(/^[a-zA-Z]:\\/, '\\').startsWith(file)))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow listing cached files without an options object', async (t) => {
  t.true(Array.isArray(await list()))
})

// Windows does not allow deleting directory uses as current directory
if (process.platform !== 'win32') {
  test('Should work when cwd does not exist', async (t) => {
    const tmpDir = await createTmpDir()
    await removeFiles(tmpDir)
    t.true(Array.isArray(await list({ cwd: tmpDir })))
  })
}
