const test = require('ava')

const { pWriteFile, createTmpDir, removeFiles } = require('./helpers/main')

const cacheUtils = require('..')

test('Should allow caching according to a digest file', async t => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    await Promise.all([pWriteFile(srcFile, 'test'), pWriteFile(digest, 'digest')])
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digest] }))
    await pWriteFile(srcFile, 'newTest')
    t.false(await cacheUtils.save(srcDir, { cacheDir, digests: [digest] }))
    await pWriteFile(digest, 'newDigest')
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digest] }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow caching according to several potential digests files', async t => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    const digest = `${srcDir}/digest`
    const digestTwo = `${srcDir}/digestTwo`
    await Promise.all([pWriteFile(srcFile, 'test'), pWriteFile(digest, 'digest')])
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digestTwo, digest] }))
    await pWriteFile(srcFile, 'newTest')
    t.false(await cacheUtils.save(srcDir, { cacheDir, digests: [digestTwo, digest] }))
    await pWriteFile(digest, 'newDigest')
    t.true(await cacheUtils.save(srcDir, { cacheDir, digests: [digestTwo, digest] }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should ignore non-existing digests files', async t => {
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
