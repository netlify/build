import { homedir } from 'os'
import { platform } from 'process'
import { access } from 'fs/promises'

import { test, expect } from 'vitest'

import { save, restore } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should allow caching files in home directory', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile({ tmpdir: homedir() })])
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

test('Should not allow caching the current directory', async () => {
  await expect(() => save('.')).rejects.toThrow()
})

test('Should not allow caching a direct parent directory', async () => {
  await expect(() => save('..')).rejects.toThrow()
})

// Windows does not allow deleting directory uses as current directory
if (platform !== 'win32') {
  test('Should not allow invalid cwd with relative paths', async () => {
    const tmpDir = await createTmpDir()
    await removeFiles(tmpDir)
    await expect(() => save('test', { cwd: tmpDir })).rejects.toThrow()
  })

  test('Should allow invalid cwd with absolute paths', async () => {
    const [tmpDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
    await removeFiles(tmpDir)
    try {
      await save(srcFile, { cwd: tmpDir })
      await removeFiles(srcFile)
      await restore(srcFile, { cwd: tmpDir })

      try {
        await access(srcFile)
        expect(true).toBe(true)
      } catch {
        expect(true).toBe(false)
      }
    } finally {
      await removeFiles(srcDir)
    }
    expect.assertions(1)
  })
}
