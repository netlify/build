import test from 'ava'
import { pathExists } from 'path-exists'

import { save, restore } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

test('Should allow moving files instead of copying them', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await save(srcFile, { cacheDir, move: true }))
    t.false(await pathExists(srcFile))
    t.true(await restore(srcFile, { cacheDir, move: true }))
    t.true(await pathExists(srcFile))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
