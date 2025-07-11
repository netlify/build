import { access } from 'fs/promises'
import { test, expect } from 'vitest'

import { save, restore } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should allow moving files instead of copying them', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await save(srcFile, { cacheDir, move: true })).toBe(true)

    try {
      await access(srcFile)
      expect(true).toBe(false)
    } catch {
      expect(true).toBe(true)
    }

    expect(await restore(srcFile, { cacheDir, move: true })).toBe(true)

    try {
      await access(srcFile)
      expect(true).toBe(true)
    } catch {
      expect(true).toBe(false)
    }
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
  expect.assertions(4)
})
