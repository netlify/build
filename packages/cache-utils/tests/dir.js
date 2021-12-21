import { cwd as getCwd, chdir } from 'process'

import test from 'ava'
import pathExists from 'path-exists'

import { save, restore } from '../src/main.js'

import { pWriteFile, pReaddir, createTmpDir, removeFiles } from './helpers/main.js'

test('Should allow changing the cache directory', async (t) => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  const currentDir = getCwd()
  chdir(srcDir)
  try {
    const srcFile = `${srcDir}/test`
    await pWriteFile(srcFile, '')
    t.true(await save(srcFile, { cacheDir }))
    const cachedFiles = await pReaddir(cacheDir)
    t.is(cachedFiles.length, 1)
    await removeFiles(srcFile)
    t.true(await restore(srcFile, { cacheDir }))
    t.true(await pathExists(srcFile))
  } finally {
    chdir(currentDir)
    await removeFiles([cacheDir, srcDir])
  }
})
