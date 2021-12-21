import test from 'ava'

import { save, remove, restore } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should allow removing one cached file', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await save(srcFile, { cacheDir }))
    t.true(await remove(srcFile, { cacheDir }))
    t.false(await restore(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow removing several cached files', async (t) => {
  const [cacheDir, [srcFile, srcDir], [otherSrcFile, otherSrcDir]] = await Promise.all([
    createTmpDir(),
    createTmpFile(),
    createTmpFile(),
  ])
  try {
    t.true(await save([srcFile, otherSrcFile], { cacheDir }))
    t.true(await remove([srcFile, otherSrcFile], { cacheDir }))
    t.false(await restore([srcFile, otherSrcFile], { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir, otherSrcDir])
  }
})

test('Should ignore when trying to remove non-cached files', async (t) => {
  t.false(await remove('nonExisting'))
})
