import { promises as fs } from 'fs'
import { cwd as getCwd, chdir } from 'process'

import test from 'ava'
import { pathExists } from 'path-exists'

import { save, restore } from '../lib/main.js'

import { createTmpDir, removeFiles } from './helpers/main.js'

test('Should allow changing the cache directory', async (t) => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  const currentDir = getCwd()
  chdir(srcDir)
  try {
    const srcFile = `${srcDir}/test`
    await fs.writeFile(srcFile, '')
    t.true(await save(srcFile, { cacheDir }))
    const cachedFiles = await fs.readdir(cacheDir)
    t.is(cachedFiles.length, 1)
    await removeFiles(srcFile)
    t.true(await restore(srcFile, { cacheDir }))
    t.true(await pathExists(srcFile))
  } finally {
    chdir(currentDir)
    await removeFiles([cacheDir, srcDir])
  }
})
