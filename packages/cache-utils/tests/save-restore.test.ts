import { promises as fs } from 'fs'
import { access } from 'fs/promises'

import { expect, test } from 'vitest'

import { save, restore, bindOpts, getCacheDir } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should expose several methods', () => {
  expect(typeof bindOpts).toBe('function')
  expect(typeof getCacheDir).toBe('function')
})

test('Should cache and restore one file', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await save(srcFile, { cacheDir })).toBe(true)
    await removeFiles(srcFile)
    expect(await restore(srcFile, { cacheDir })).toBe(true)

    try {
      await access(srcFile)
      expect(true).toBe(true)
    } catch {
      expect(true).toBe(false)
    }
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should cache and restore several files', async () => {
  const [cacheDir, [srcFile, srcDir], [otherSrcFile, otherSrcDir]] = await Promise.all([
    createTmpDir(),
    createTmpFile(),
    createTmpFile(),
  ])
  try {
    expect(await save([srcFile, otherSrcFile], { cacheDir })).toBe(true)
    await removeFiles(srcFile)
    expect(await restore([srcFile, otherSrcFile], { cacheDir })).toBe(true)

    const results = await Promise.all([
      access(srcFile).then(() => true).catch(() => false),
      access(otherSrcFile).then(() => true).catch(() => false)
    ])
    expect(results).toEqual([true, true])
  } finally {
    await removeFiles([cacheDir, srcDir, otherSrcDir])
  }
})

test('Should cache and restore one directory', async () => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    await fs.writeFile(srcFile, '')
    expect(await save(srcDir, { cacheDir })).toBe(true)
    await removeFiles(srcDir)
    expect(await restore(srcDir, { cacheDir })).toBe(true)

    try {
      await access(srcFile)
      expect(true).toBe(true)
    } catch {
      expect(true).toBe(false)
    }
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should keep file contents when caching files', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    await fs.writeFile(srcFile, 'test')
    expect(await save(srcFile, { cacheDir })).toBe(true)
    await removeFiles(srcFile)
    expect(await restore(srcFile, { cacheDir })).toBe(true)

    try {
      await access(srcFile)
      expect(true).toBe(true)
    } catch {
      expect(true).toBe(false)
    }

    expect(await fs.readFile(srcFile, 'utf8')).toBe('test')
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should overwrite files on restore', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    await fs.writeFile(srcFile, 'test')
    expect(await save(srcFile, { cacheDir })).toBe(true)
    await fs.writeFile(srcFile, 'newTest')
    expect(await restore(srcFile, { cacheDir })).toBe(true)

    try {
      await access(srcFile)
      expect(true).toBe(true)
    } catch {
      expect(true).toBe(false)
    }

    expect(await fs.readFile(srcFile, 'utf8')).toBe('test')
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should skip non-existing files on save', async () => {
  expect(await save('nonExisting')).toBe(false)
})

test('Should skip non-existing files on restore', async () => {
  expect(await restore('nonExisting')).toBe(false)
})

test('Should skip empty directories on save', async () => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    expect(await save(srcDir, { cacheDir })).toBe(false)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should skip empty directories on restore', async () => {
  const cacheDir = await createTmpDir()

  try {
    const srcDir = 'test'
    const cacheSubDir = `${cacheDir}/cwd/${srcDir}`
    await fs.mkdir(cacheSubDir, { recursive: true })

    expect(await restore(srcDir, { cacheDir })).toBe(false)
  } finally {
    await removeFiles([cacheDir])
  }
})

test('Should skip deep empty directories on save', async () => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcSubDir = `${srcDir}/test`
    await fs.mkdir(srcSubDir, { recursive: true })

    expect(await save(srcSubDir, { cacheDir })).toBe(false)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should skip deep empty directories on restore', async () => {
  const cacheDir = await createTmpDir()

  try {
    const srcDir = 'test'
    const srcSubDir = `${srcDir}/test`
    const cacheSubDir = `${cacheDir}/cwd/${srcSubDir}`
    await fs.mkdir(cacheSubDir, { recursive: true })

    expect(await restore(srcDir, { cacheDir })).toBe(false)
  } finally {
    await removeFiles([cacheDir])
  }
})
