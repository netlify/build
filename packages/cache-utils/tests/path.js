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

// Windows does not allow deleting directory uses as current directory
if (process.platform !== 'win32') {
  // Need to use `test.serial()` due to `process.chdir()`
  test.serial('Should not allow invalid cwd with relative paths', async t => {
    const tmpDir = await createTmpDir()
    const oldCwd = process.cwd()
    process.chdir(tmpDir)
    await removeFiles(tmpDir)
    try {
      await t.throwsAsync(cacheUtils.save('test'))
    } finally {
      process.chdir(oldCwd)
    }
  })

  test.serial('Should allow invalid cwd with absolute paths', async t => {
    const [tmpDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
    const oldCwd = process.cwd()
    process.chdir(tmpDir)
    await removeFiles(tmpDir)
    try {
      await t.notThrowsAsync(cacheUtils.save(srcFile))
      await removeFiles(srcFile)
      await t.notThrowsAsync(cacheUtils.restore(srcFile))
      t.true(await pathExists(srcFile))
    } finally {
      process.chdir(oldCwd)
      await removeFiles(srcDir)
    }
  })
}
