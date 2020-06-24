const process = require('process')

const test = require('ava')

const cacheUtils = require('..')

const { createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

test('Should allow listing cached files', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.deepEqual(await cacheUtils.list({ cacheDir }), [])
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    const files = await cacheUtils.list({ cacheDir })
    t.is(files.length, 2)
    t.true(files.every(file => srcFile.replace(/^[a-zA-Z]:\\/, '\\').startsWith(file)))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should allow listing cached files without an options object', async t => {
  t.true(Array.isArray(await cacheUtils.list()))
})

// Windows does not allow deleting directory uses as current directory
if (process.platform !== 'win32') {
  test('Should work when cwd does not exist', async t => {
    const tmpDir = await createTmpDir()
    await removeFiles(tmpDir)
    t.true(Array.isArray(await cacheUtils.list({ cwd: tmpDir })))
  })
}
