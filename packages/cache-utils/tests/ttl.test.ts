import { test, expect } from 'vitest'
import { setTimeout } from 'timers/promises'

import { save, has, restore } from '../src/main.js'

import { createTmpDir, createTmpFile, removeFiles } from './helpers/main.js'

// 2 seconds
const TTL_TIMEOUT = 2e3

// Relies on timing
test('Should allow a TTL on cached files', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await save(srcFile, { cacheDir, ttl: 1 })).toBe(true)
    await setTimeout(TTL_TIMEOUT)
    expect(await has(srcFile, { cacheDir })).toBe(false)
    expect(await restore(srcFile, { cacheDir })).toBe(false)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should skip TTL when the value is invalid', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await save(srcFile, { cacheDir, ttl: '1' })).toBe(true)
    await setTimeout(TTL_TIMEOUT)
    expect(await has(srcFile, { cacheDir })).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should skip TTL when the value is negative', async () => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    expect(await save(srcFile, { cacheDir, ttl: -1 })).toBe(true)
    await setTimeout(TTL_TIMEOUT)
    expect(await has(srcFile, { cacheDir })).toBe(true)
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
