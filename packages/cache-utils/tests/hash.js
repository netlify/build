const { cpus } = require('os')

const test = require('ava')
const pMap = require('p-map')

const { pWriteFile, createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

const cacheUtils = require('..')

test('Should not save identically cached file', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    t.false(await cacheUtils.save(srcFile, { cacheDir }))
    await pWriteFile(srcFile, 'test')
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should not save identically cached directory', async t => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    await pWriteFile(srcFile, '')
    t.true(await cacheUtils.save(srcDir, { cacheDir }))
    t.false(await cacheUtils.save(srcDir, { cacheDir }))
    await pWriteFile(srcFile, 'test')
    t.true(await cacheUtils.save(srcDir, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should not save several identically cached files', async t => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const indexes = Array.from({ length: 1e2 }, index => index)
    await pMap(indexes, async index => pWriteFile(`${srcDir}/${index}`, ''), {
      concurrency: cpus().length,
    })
    t.true(await cacheUtils.save(srcDir, { cacheDir }))
    t.false(await cacheUtils.save(srcDir, { cacheDir }))
    await pWriteFile(`${srcDir}/1`, 'test')
    t.true(await cacheUtils.save(srcDir, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})
