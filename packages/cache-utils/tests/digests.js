import { promises as fs } from 'fs'

import test from 'ava'

import { save, restore } from '../lib/main.js'

import { createTmpDir, removeFiles } from './helpers/main.js'

test('Should allow caching according to a digest file', async (t) => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    await Promise.all([fs.writeFile(srcFile, 'test'), fs.writeFile(digest, 'digest')])
    t.true(await save(srcDir, { cacheDir, digests: [digest] }))
    await fs.writeFile(srcFile, 'newTest')
    t.true(await save(srcDir, { cacheDir, digests: [digest] }))
    t.true(await restore(srcDir, { cacheDir, digests: [digest] }))
    const content = await fs.readFile(srcFile, 'utf8')
    t.is(content, 'test')
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow caching according to several potential digests files', async (t) => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    const digestTwo = `${srcDir}/digestTwo`
    await Promise.all([fs.writeFile(srcFile, 'test'), fs.writeFile(digest, 'digest')])
    t.true(await save(srcDir, { cacheDir, digests: [digestTwo, digest] }))
    await fs.writeFile(srcFile, 'newTest')
    t.true(await save(srcDir, { cacheDir, digests: [digestTwo, digest] }))
    t.true(await restore(srcDir, { cacheDir, digests: [digestTwo, digest] }))
    const content = await fs.readFile(srcFile, 'utf8')
    t.is(content, 'test')
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should ignore non-existing digests files', async (t) => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    await fs.writeFile(srcFile, 'test')
    t.true(await save(srcDir, { cacheDir, digests: [digest] }))
    await fs.writeFile(srcFile, 'newTest')
    t.true(await save(srcDir, { cacheDir, digests: [digest] }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
