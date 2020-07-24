const test = require('ava')
const makeDir = require('make-dir')
const pathExists = require('path-exists')

const cacheUtils = require('..')

const { pWriteFile, pReadFile, createTmpDir, createTmpFile, removeFiles } = require('./helpers/main')

test('Should expose several methods', async t => {
  t.deepEqual(Object.keys(cacheUtils).sort(), ['bindOpts', 'getCacheDir', 'has', 'list', 'remove', 'restore', 'save'])
})

test('Should cache and restore one file', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    await removeFiles(srcFile)
    t.true(await cacheUtils.restore(srcFile, { cacheDir }))
    t.true(await pathExists(srcFile))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should cache and restore several files', async t => {
  const [cacheDir, [srcFile, srcDir], [otherSrcFile, otherSrcDir]] = await Promise.all([
    createTmpDir(),
    createTmpFile(),
    createTmpFile(),
  ])
  try {
    t.true(await cacheUtils.save([srcFile, otherSrcFile], { cacheDir }))
    await removeFiles(srcFile)
    t.true(await cacheUtils.restore([srcFile, otherSrcFile], { cacheDir }))
    t.deepEqual(await Promise.all([pathExists(srcFile), pathExists(otherSrcFile)]), [true, true])
  } finally {
    await removeFiles([cacheDir, srcDir, otherSrcDir])
  }
})

test('Should cache and restore one directory', async t => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcFile = `${srcDir}/test`
    await pWriteFile(srcFile, '')
    t.true(await cacheUtils.save(srcDir, { cacheDir }))
    await removeFiles(srcDir)
    t.true(await cacheUtils.restore(srcDir, { cacheDir }))
    t.true(await pathExists(srcFile))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should keep file contents when caching files', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    await pWriteFile(srcFile, 'test')
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    await removeFiles(srcFile)
    t.true(await cacheUtils.restore(srcFile, { cacheDir }))
    t.true(await pathExists(srcFile))
    t.is(await pReadFile(srcFile, 'utf8'), 'test')
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should overwrite files on restore', async t => {
  const [cacheDir, [srcFile, srcDir]] = await Promise.all([createTmpDir(), createTmpFile()])
  try {
    await pWriteFile(srcFile, 'test')
    t.true(await cacheUtils.save(srcFile, { cacheDir }))
    await pWriteFile(srcFile, 'newTest')
    t.true(await cacheUtils.restore(srcFile, { cacheDir }))
    t.true(await pathExists(srcFile))
    t.is(await pReadFile(srcFile, 'utf8'), 'test')
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should skip non-existing files on save', async t => {
  t.false(await cacheUtils.save('nonExisting'))
})

test('Should skip non-existing files on restore', async t => {
  t.false(await cacheUtils.restore('nonExisting'))
})

test('Should skip empty directories on save', async t => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    t.false(await cacheUtils.save(srcDir, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should skip empty directories on restore', async t => {
  const cacheDir = await createTmpDir()

  try {
    const srcDir = 'test'
    const cacheSubDir = `${cacheDir}/cwd/${srcDir}`
    await makeDir(cacheSubDir)

    t.false(await cacheUtils.restore(srcDir, { cacheDir }))
  } finally {
    await removeFiles([cacheDir])
  }
})

test('Should skip deep empty directories on save', async t => {
  const [cacheDir, srcDir] = await Promise.all([createTmpDir(), createTmpDir()])
  try {
    const srcSubDir = `${srcDir}/test`
    await makeDir(srcSubDir)

    t.false(await cacheUtils.save(srcSubDir, { cacheDir }))
  } finally {
    await removeFiles([cacheDir, srcDir])
  }
})

test('Should skip deep empty directories on restore', async t => {
  const cacheDir = await createTmpDir()

  try {
    const srcDir = 'test'
    const srcSubDir = `${srcDir}/test`
    const cacheSubDir = `${cacheDir}/cwd/${srcSubDir}`
    await makeDir(cacheSubDir)

    t.false(await cacheUtils.restore(srcDir, { cacheDir }))
  } finally {
    await removeFiles([cacheDir])
  }
})
