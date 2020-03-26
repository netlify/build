const test = require('ava')
const pathExists = require('path-exists')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

const cacheUtils = require('..')

test('Should allow moving files instead of copying them', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir, move: true }))
    t.false(await pathExists(srcFile))
    t.true(await cacheUtils.restore(srcFile, { cacheDir, move: true }))
    t.true(await pathExists(srcFile))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
