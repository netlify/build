const test = require('ava')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

const cacheUtils = require('..')

test('Should allow checking if one file is cached', async t => {
  const [cacheDir, srcFile] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.false(await cacheUtils.has(srcFile, { cacheDir }))
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    t.true(await cacheUtils.has(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcFile])
  }
})

test('Should allow checking if several files are cached', async t => {
  const [cacheDir, srcFile, otherSrcFile] = await Promise.all([createTmpDir(), createTmpFile(), createTmpFile()])
  try {
    t.false(await cacheUtils.has([srcFile, otherSrcFile], { cacheDir }))
    t.true(await cacheUtils.save([srcFile, otherSrcFile], { cacheDir }))
    t.true(await cacheUtils.has([srcFile, otherSrcFile], { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcFile, otherSrcFile])
  }
})

test('Should allow checking if one file is cached without an options object', async t => {
  t.is(typeof (await cacheUtils.has('doesNotExist')), 'boolean')
})
