const test = require('ava')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

const cacheUtils = require('..')

test('Should allow removing one cached file', async t => {
  const [cacheDir, srcFile] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    t.true(await cacheUtils.remove(srcFile, { cacheDir }))
    t.false(await cacheUtils.restore(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcFile])
  }
})

test('Should allow removing several cached files', async t => {
  const [cacheDir, srcFile, otherSrcFile] = await Promise.all([createTmpDir(), createTmpFile(), createTmpFile()])
  try {
    t.true(await cacheUtils.save([srcFile, otherSrcFile], { cacheDir }))
    t.true(await cacheUtils.remove([srcFile, otherSrcFile], { cacheDir }))
    t.false(await cacheUtils.restore([srcFile, otherSrcFile], { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcFile, otherSrcFile])
  }
})

test('Should ignore when trying to remove non-cached files', async t => {
  t.false(await cacheUtils.remove('nonExisting'))
})
