const test = require('ava')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

const cacheUtils = require('..')

test('Should allow listing cached files', async t => {
  const [cacheDir, srcFile] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.deepEqual(await cacheUtils.list({ cacheDir }), [])
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    t.deepEqual(await cacheUtils.list({ cacheDir }), [srcFile])
  } finally {
    await removeFiles([cacheDir, srcFile])
  }
})

test('Should allow listing cached files without an options object', async t => {
  t.true(Array.isArray(await cacheUtils.list()))
})
