const process = require('process')

const test = require('ava')

const cacheUtils = require('..')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

test('Should allow listing cached files', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.deepEqual(await cacheUtils.list({ cacheDir }), [])
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    t.deepEqual(await cacheUtils.list({ cacheDir }), [srcFile.replace(/^[a-zA-Z]:\\/, '\\')])
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow listing cached files without an options object', async t => {
  t.true(Array.isArray(await cacheUtils.list()))
})

// Windows does not allow deleting directory uses as current directory
if (process.platform !== 'win32') {
  // Need to use `test.serial()` due to `process.chdir()`
  test.serial('Should work when cwd does not exist', async t => {
    const tmpDir = await createTmpDir()
    const oldCwd = process.cwd()
    process.chdir(tmpDir)
    await removeFiles(tmpDir)
    try {
      t.true(Array.isArray(await cacheUtils.list()))
    } finally {
      process.chdir(oldCwd)
    }
  })
}
