import { existsSync } from 'node:fs'
import { test, expect } from 'vitest'

import { save, restore } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should allow moving files instead of copying them', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await save(srcFile, { cacheDir, move: true })).toBe(true)
    expect(existsSync(srcFile)).toBe(false)
    expect(await restore(srcFile, { cacheDir, move: true })).toBe(true)
    expect(existsSync(srcFile)).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
  expect.assertions(4)
})
