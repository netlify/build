import test from 'ava'

import { has, save } from '../src/main.js'

import { createTmpDir, createTmpFile, createTmpFiles, removeFiles } from './helpers/main.js'

test('Should allow checking if one file is cached', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.false(await has(srcFile, { cacheDir }))
    t.true(await save(srcFile, { cacheDir }))
    t.true(await has(srcFile, { cacheDir }))
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
    t.false(await has([srcFile, otherSrcFile], { cacheDir }))
    t.true(await save([srcFile, otherSrcFile], { cacheDir }))
    t.true(await has([srcFile, otherSrcFile], { cacheDir }))
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
    t.false(await has(junkFile, { cacheDir }))
    t.true(await save(srcFilesDir, { cacheDir }))
    t.false(await has(junkFile, { cacheDir }))
    t.true(await has(srcFile, { cacheDir }))
    t.true(await has(otherSrcFile, { cacheDir }))
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
    t.false(await has(junkFile, { cacheDir }))
    t.false(await save(junkFileDir, { cacheDir }))
    t.false(await has(junkFile, { cacheDir }))
    t.false(await save(emptyDir, { cacheDir }))
    t.false(await has(emptyDir, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, junkFileDir, emptyDir])
  }
})

test('Should allow checking if one file is cached without an options object', async (t) => {
  t.is(typeof (await has('doesNotExist')), 'boolean')
})
