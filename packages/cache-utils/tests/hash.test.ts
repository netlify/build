import { test, expect } from 'vitest'

import { has, save } from '../src/main.js'

import { createTmpDir, createTmpFile, createTmpFiles, removeFiles } from './helpers/main.js'

test('Should allow checking if one file is cached', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await has(srcFile, { cacheDir })).toBe(false)
    expect(await save(srcFile, { cacheDir })).toBe(true)
    expect(await has(srcFile, { cacheDir })).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow checking if several files are cached', async () => {
  const [cacheDir, [srcFile, srcDir], [otherSrcFile, otherSrcDir]] = await Promise.all([
    createTmpDir(),
    createTmpFile(),
    createTmpFile(),
  ])
  try {
    expect(await has([srcFile, otherSrcFile], { cacheDir })).toBe(false)
    expect(await save([srcFile, otherSrcFile], { cacheDir })).toBe(true)
    expect(await has([srcFile, otherSrcFile], { cacheDir })).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir, otherSrcDir])
  }
})

test('Should not list junk files as cached nor cache them', async () => {
  const [cacheDir, [[junkFile, srcFile, otherSrcFile], srcFilesDir]] = await Promise.all([
    createTmpDir(),
    // Create 3 files under the same temporary dir, including a .DS_Store junk file
    createTmpFiles([{ name: '.DS_Store' }, {}, {}]),
  ])
  try {
    expect(await has(junkFile, { cacheDir })).toBe(false)
    expect(await save(srcFilesDir, { cacheDir })).toBe(true)
    expect(await has(junkFile, { cacheDir })).toBe(false)
    expect(await has(srcFile, { cacheDir })).toBe(true)
    expect(await has(otherSrcFile, { cacheDir })).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcFilesDir])
  }
})

test('Should not list empty directories as cached nor cache them', async () => {
  const [cacheDir, [junkFile, junkFileDir], emptyDir] = await Promise.all([
    createTmpDir(),
    // Create a directory with a junk .DS_Store file
    createTmpFile({ name: '.DS_Store' }),
    // Create an empty directory
    createTmpDir(),
  ])
  try {
    expect(await has(junkFile, { cacheDir })).toBe(false)
    expect(await save(junkFileDir, { cacheDir })).toBe(false)
    expect(await has(junkFile, { cacheDir })).toBe(false)
    expect(await save(emptyDir, { cacheDir })).toBe(false)
    expect(await has(emptyDir, { cacheDir })).toBe(false)
  } finally {
    await removeFiles([cacheDir, junkFileDir, emptyDir])
  }
})

test('Should allow checking if one file is cached without an options object', async () => {
  expect(typeof (await has('doesNotExist'))).toBe('boolean')
})
