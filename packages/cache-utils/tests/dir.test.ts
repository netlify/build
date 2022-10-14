import { promises as fs } from 'fs'

import { pathExists } from 'path-exists'
import { expect, test, vi } from 'vitest'

import { restore, save } from '../src/main.js'

import { createTmpDir, removeFiles } from './helpers/main.js'

test('Should allow changing the cache directory', async () => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  const cwdSpy = vi.spyOn(process, 'cwd').mockImplementation(() => srcDir)
  try {
    const srcFile = `${srcDir}/test`
    await fs.writeFile(srcFile, '')
    expect(await save(srcFile, { cacheDir })).toBe(true)
    const cachedFiles = await fs.readdir(cacheDir)
    expect(cachedFiles.length).toBe(1)
    await removeFiles(srcFile)
    expect(await restore(srcFile, { cacheDir })).toBe(true)
    expect(await pathExists(srcFile)).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
  cwdSpy.mockRestore()
})
