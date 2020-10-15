const test = require('ava')

const cacheUtils = require('..')

const { pWriteFile, pReadFile, createTmpDir, removeFiles } = require('./helpers/main')

test('Should allow caching according to a digest file', async (t) => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    await Promise.all([pWriteFile(srcFile, 'test'), pWriteFile(digest, 'digest')])
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digest] }))
    await pWriteFile(srcFile, 'newTest')
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digest] }))
    t.true(await cacheUtils.restore(srcDir, { cacheDir, digests: [digest] }))
    const content = await pReadFile(srcFile, 'utf8')
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
    await Promise.all([pWriteFile(srcFile, 'test'), pWriteFile(digest, 'digest')])
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digestTwo, digest] }))
    await pWriteFile(srcFile, 'newTest')
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digestTwo, digest] }))
    t.true(await cacheUtils.restore(srcDir, { cacheDir, digests: [digestTwo, digest] }))
    const content = await pReadFile(srcFile, 'utf8')
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
    await pWriteFile(srcFile, 'test')
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digest] }))
    await pWriteFile(srcFile, 'newTest')
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digest] }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
