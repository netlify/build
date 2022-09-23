import test from 'ava'

import { save, has, restore } from '../lib/main.js'

import { pSetTimeout, createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

// 2 seconds
const TTL_TIMEOUT = 2e3

// Relies on timing
test.serial('Should allow a TTL on cached files', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await save(srcFile, { cacheDir, ttl: 1 }))
    await pSetTimeout(TTL_TIMEOUT)
    t.false(await has(srcFile, { cacheDir }))
    t.false(await restore(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test.serial('Should skip TTL when the value is invalid', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await save(srcFile, { cacheDir, ttl: '1' }))
    await pSetTimeout(TTL_TIMEOUT)
    t.true(await has(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test.serial('Should skip TTL when the value is negative', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await save(srcFile, { cacheDir, ttl: -1 }))
    await pSetTimeout(TTL_TIMEOUT)
    t.true(await has(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
