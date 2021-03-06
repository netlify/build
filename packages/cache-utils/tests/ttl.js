'use strict'

const test = require('ava')

const cacheUtils = require('..')

const { pSetTimeout, createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

// 2 seconds
const TTL_TIMEOUT = 2e3

// Relies on timing
test.serial('Should allow a TTL on cached files', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir, ttl: 1 }))
    await pSetTimeout(TTL_TIMEOUT)
    t.false(await cacheUtils.has(srcFile, { cacheDir }))
    t.false(await cacheUtils.restore(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test.serial('Should skip TTL when the value is invalid', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir, ttl: '1' }))
    await pSetTimeout(TTL_TIMEOUT)
    t.true(await cacheUtils.has(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test.serial('Should skip TTL when the value is negative', async (t) => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir, ttl: -1 }))
    await pSetTimeout(TTL_TIMEOUT)
    t.true(await cacheUtils.has(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
