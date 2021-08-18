'use strict'

const test = require('ava')

const cacheUtils = require('..')

const { createTmpDir, createTmpFile, createTmpFiles, removeFiles } = require('./helpers/main')

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

test('Should not list junk files as cached nor cache them', async (t) => {
  const [cacheDir, [[junkFile, srcFile, otherSrcFile], srcFilesDir]] = await Promise.all([
    createTmpDir(),
    // Create 3 files under the same temporary dir, including a .DS_Store junk file
    createTmpFiles([{ name: '.DS_Store' }, {}, {}]),
  ])
  try {
    t.false(await cacheUtils.has(junkFile, { cacheDir }))
    t.true(await cacheUtils.save(srcFilesDir, { cacheDir }))
    t.false(await cacheUtils.has(junkFile, { cacheDir }))
    t.true(await cacheUtils.has(srcFile, { cacheDir }))
    t.true(await cacheUtils.has(otherSrcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcFilesDir])
  }
})

test('Should not list empty directories as cached nor cache them', async (t) => {
  const [cacheDir, [junkFile, junkFileDir], emptyDir] = await Promise.all([
    createTmpDir(),
    // Create a directory with a junk .DS_Store file
    createTmpFile({ name: '.DS_Store' }),
    // Create an empty directory
    createTmpDir(),
  ])
  try {
    t.false(await cacheUtils.has(junkFile, { cacheDir }))
    t.false(await cacheUtils.save(junkFileDir, { cacheDir }))
    t.false(await cacheUtils.has(junkFile, { cacheDir }))
    t.false(await cacheUtils.save(emptyDir, { cacheDir }))
    t.false(await cacheUtils.has(emptyDir, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, junkFileDir, emptyDir])
  }
})

test('Should allow checking if one file is cached without an options object', async (t) => {
  t.is(typeof (await cacheUtils.has('doesNotExist')), 'boolean')
})
