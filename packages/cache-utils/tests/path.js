const { homedir } = require('os')

const test = require('ava')
const pathExists = require('path-exists')

const cacheUtils = require('..')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

test('Should allow caching files in home directory', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile({ dir: homedir() })])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    await removeFiles(srcFile)
    t.true(await cacheUtils.restore(srcFile, { cacheDir }))
    t.true(await pathExists(srcFile))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should not allow caching the current directory', async t => {
  await t.throwsAsync(cacheUtils.save('.'))
})

test('Should not allow caching a direct parent directory', async t => {
  await t.throwsAsync(cacheUtils.save('..'))
})
