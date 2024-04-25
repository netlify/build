import process from 'process'

import { test, expect } from 'vitest'

import { list, save } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should allow listing cached files', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await list({ cacheDir })).toEqual([])
    expect(await save(srcFile, { cacheDir })).toBe(true)
    const files = await list({ cacheDir })
    expect(files.length).toBe(2)
    expect(files.every((file) => srcFile.replace(/^[a-zA-Z]:\\/, '\\').startsWith(file))).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow changing the listing depth', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await list({ cacheDir })).toEqual([])
    expect(await save(srcFile, { cacheDir })).toBe(true)
    const files = await list({ cacheDir, depth: 0 })
    expect(files.length).toBe(1)
    expect(files.every((file) => srcFile.replace(/^[a-zA-Z]:\\/, '\\').startsWith(file))).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow listing cached files without an options object', async () => {
  expect(Array.isArray(await list())).toBe(true)
})

// Windows does not allow deleting directory uses as current directory
if (process.platform !== 'win32') {
  test('Should work when cwd does not exist', async () => {
    const tmpDir = await createTmpDir()
    await removeFiles(tmpDir)
    expect(Array.isArray(await list({ cwd: tmpDir }))).toBe(true)
  })
}
