const test = require('ava')
const pathExists = require('path-exists')

const cacheUtils = require('..')

const { pWriteFile, createTmpDir, removeFiles } = require('./helpers/main')

test('Should allow not changing the cache directory', async t => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  const currentDir = process.cwd()
  process.chdir(srcDir)
  try {
    const srcFile = `${srcDir}/test`
    await pWriteFile(srcFile, '')
    t.true(await cacheUtils.save(srcFile))
    await removeFiles(srcFile)
    t.true(await cacheUtils.restore(srcFile))
    t.true(await pathExists(srcFile))
  } finally {
    process.chdir(currentDir)
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow not changing the cache directory in CI', async t => {
  const cacheDir = await cacheUtils.getCacheDir({ mode: 'buildbot', isTest: true })
  t.true(await pathExists(cacheDir))
})
