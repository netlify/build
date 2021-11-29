'use strict'

const { cwd: getCwd, chdir } = require('process')

const test = require('ava')
const pathExists = require('path-exists')

const cacheUtils = require('..')

const { pWriteFile, pReaddir, createTmpDir, removeFiles } = require('./helpers/main')

test('Should allow changing the cache directory', async (t) => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  const currentDir = getCwd()
  chdir(srcDir)
  try {
    const srcFile = `${srcDir}/test`
    await pWriteFile(srcFile, '')
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    const cachedFiles = await pReaddir(cacheDir)
    t.is(cachedFiles.length, 1)
    await removeFiles(srcFile)
    t.true(await cacheUtils.restore(srcFile, { cacheDir }))
    t.true(await pathExists(srcFile))
  } finally {
    chdir(currentDir)
    await removeFiles([cacheDir, srcDir])
  }
})
