import { expect, test } from 'vitest'

import { save, remove, restore } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should allow removing one cached file', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await save(srcFile, { cacheDir })).toBe(true)
    expect(await remove(srcFile, { cacheDir })).toBe(true)
    expect(await restore(srcFile, { cacheDir })).toBe(false)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow removing several cached files', async () => {
  const [cacheDir, [srcFile, srcDir], [otherSrcFile, otherSrcDir]] = await Promise.all([
    createTmpDir(),
    createTmpFile(),
    createTmpFile(),
  ])
  try {
    expect(await save([srcFile, otherSrcFile], { cacheDir })).toBe(true)
    expect(await remove([srcFile, otherSrcFile], { cacheDir })).toBe(true)
    expect(await restore([srcFile, otherSrcFile], { cacheDir })).toBe(false)
  } finally {
    await removeFiles([cacheDir, srcDir, otherSrcDir])
  }
})

test('Should ignore when trying to remove non-cached files', async () => {
  expect(await remove('nonExisting')).toBe(false)
})
