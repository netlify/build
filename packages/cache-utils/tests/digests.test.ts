import { promises as fs } from 'fs'

import { test, expect } from 'vitest'

import { save, restore } from '../src/main.js'

import { createTmpDir, removeFiles } from './helpers/main.js'

test('Should allow caching according to a digest file', async () => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    await Promise.all([fs.writeFile(srcFile, 'test'), fs.writeFile(digest, 'digest')])
    expect(await save(srcDir, { cacheDir, digests: [digest] })).toBe(true)
    await fs.writeFile(srcFile, 'newTest')
    expect(await save(srcDir, { cacheDir, digests: [digest] })).toBe(true)
    expect(await restore(srcDir, { cacheDir, digests: [digest] })).toBe(true)
    const content = await fs.readFile(srcFile, 'utf8')
    expect(content).toBe('test')
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow caching according to several potential digests files', async () => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    const digestTwo = `${srcDir}/digestTwo`
    await Promise.all([fs.writeFile(srcFile, 'test'), fs.writeFile(digest, 'digest')])
    expect(await save(srcDir, { cacheDir, digests: [digestTwo, digest] })).toBe(true)
    await fs.writeFile(srcFile, 'newTest')
    expect(await save(srcDir, { cacheDir, digests: [digestTwo, digest] })).toBe(true)
    expect(await restore(srcDir, { cacheDir, digests: [digestTwo, digest] })).toBe(true)
    const content = await fs.readFile(srcFile, 'utf8')
    expect(content).toBe('test')
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should ignore non-existing digests files', async () => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    await fs.writeFile(srcFile, 'test')
    expect(await save(srcDir, { cacheDir, digests: [digest] })).toBe(true)
    await fs.writeFile(srcFile, 'newTest')
    expect(await save(srcDir, { cacheDir, digests: [digest] })).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
