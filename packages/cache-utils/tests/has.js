'use strict'

const test = require('ava')

const cacheUtils = require('..')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

test('Should allow checking if one file is cached', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.false(await cacheUtils.has(srcFile, { cacheDir }))
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    t.true(await cacheUtils.has(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow checking if several files are cached', async (t) => {
  const [cacheDir, [srcFile, srcDir], [otherSrcFile, otherSrcDir]] = await Promise.all([
    createTmpDir(),
    createTmpFile(),
    createTmpFile(),
  ])
  try {
    t.false(await cacheUtils.has([srcFile, otherSrcFile], { cacheDir }))
    t.true(await cacheUtils.save([srcFile, otherSrcFile], { cacheDir }))
    t.true(await cacheUtils.has([srcFile, otherSrcFile], { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir, otherSrcDir])
  }
})

test('Should allow checking if one file is cached without an options object', async (t) => {
  t.is(typeof (await cacheUtils.has('doesNotExist')), 'boolean')
})
