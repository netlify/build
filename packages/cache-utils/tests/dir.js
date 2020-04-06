const test = require('ava')
const pathExists = require('path-exists')

const cacheUtils = require('..')

const { pWriteFile, createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

// Need to be serial since we change the current directory
test.serial('Should allow not changing the cache directory', async t => {
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

// Need to be serial since we change the environment variables
test.serial('Should allow not changing the cache directory in CI', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  process.env.NETLIFY_BUILD_TEST = '1'
  try {
    t.true(await cacheUtils.save(srcFile, { mode: 'buildbot' }))
    await removeFiles(srcFile)
    t.true(await cacheUtils.restore(srcFile, { mode: 'buildbot' }))
    t.true(await pathExists(srcFile))
  } finally {
    delete process.env.NETLIFY_BUILD_TEST
    await removeFiles([cacheDir, srcDir])
  }
})
