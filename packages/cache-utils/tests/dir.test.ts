import { promises as fs, existsSync } from 'fs'

import { MockInstance, afterEach, beforeEach, expect, test, vi } from 'vitest'

import { restore, save } from '../src/main.js'

import { createTmpDir, removeFiles } from './helpers/main.js'

let cacheDir, srcDir: string
let cwdSpy: MockInstance<() => string>

beforeEach(async () => {
  cacheDir = await createTmpDir()
  srcDir = await createTmpDir()
  cwdSpy = vi.spyOn(process, 'cwd').mockImplementation(() => srcDir)
})

afterEach(async () => {
  await removeFiles([cacheDir, srcDir])
  cwdSpy.mockRestore()
})

test('Should allow changing the cache directory', async () => {
  const srcFile = `${srcDir}/test`
  await fs.writeFile(srcFile, '')
  expect(await save(srcFile, { cacheDir })).toBe(true)
  const cachedFiles = await fs.readdir(cacheDir)
  expect(cachedFiles.length).toBe(1)
  await removeFiles(srcFile)
  expect(await restore(srcFile, { cacheDir })).toBe(true)
  expect(existsSync(srcFile)).toBe(true)
})
