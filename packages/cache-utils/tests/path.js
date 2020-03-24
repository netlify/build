const { homedir } = require('os')

const test = require('ava')
const pathExists = require('path-exists')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

const cacheUtils = require('..')

test('Should allow caching files in home directory', async t => {
  const [cacheDir, srcFile] = await Promise.all([createTmpDir(), createTmpFile({ dir: homedir() })])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    await removeFiles(srcFile)
    t.true(await cacheUtils.restore(srcFile, { cacheDir }))
    t.true(await pathExists(srcFile))
  } finally {
    await removeFiles([cacheDir, srcFile])
  }
})
