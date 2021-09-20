'use strict'

const { normalize } = require('path')

const test = require('ava')
const cpy = require('cpy')
const del = require('del')
const pathExists = require('path-exists')
const { spy } = require('sinon')
const sortOn = require('sort-on')

const { add, list, listAll } = require('..')

const { getDist, createDist, removeDist } = require('./helpers/main')

const FIXTURES_DIR = `${__dirname}/fixtures`

test('Should copy a source file to a dist directory', async (t) => {
  const dist = await getDist()
  try {
    await add(`${FIXTURES_DIR}/file/test.js`, dist)
    t.true(await pathExists(`${dist}/test.js`))
  } finally {
    await removeDist(dist)
  }
})

test('Should copy a source directory to a dist directory', async (t) => {
  const dist = await getDist()
  try {
    await add(`${FIXTURES_DIR}/directory/test`, dist)
    t.true(await pathExists(`${dist}/test/index.js`))
  } finally {
    await removeDist(dist)
  }
})

test('Should throw when source is undefined', async (t) => {
  const dist = await getDist()
  try {
    await t.throwsAsync(add(undefined, dist))
  } finally {
    await removeDist(dist)
  }
})

test('Should throw when source is empty array', async (t) => {
  const dist = await getDist()
  try {
    await t.throwsAsync(add([], dist))
  } finally {
    await removeDist(dist)
  }
})

test('Should throw when source points to non-existing file', async (t) => {
  const dist = await getDist()
  try {
    await t.throwsAsync(add(`${FIXTURES_DIR}/file/doesNotExist.js`, dist))
  } finally {
    await removeDist(dist)
  }
})

test('Should throw when dist is undefined', async (t) => {
  await t.throwsAsync(add(`${FIXTURES_DIR}/file/test.js`))
})

test('Should copy a source file even if dist directory already exists', async (t) => {
  const dist = await createDist()
  try {
    await add(`${FIXTURES_DIR}/file/test.js`, dist)
    t.true(await pathExists(`${dist}/test.js`))
  } finally {
    await removeDist(dist)
  }
})

test('Should overwrite dist file if it already exists', async (t) => {
  const dist = await getDist()
  const fixtureDir = `${FIXTURES_DIR}/file`

  await cpy(`${fixtureDir}/test.js`, fixtureDir, { rename: 'test.js.backup' })

  try {
    await add(`${fixtureDir}/test.js`, dist)

    // eslint-disable-next-line import/no-dynamic-require, node/global-require
    const func1 = require(`${dist}/test.js`)

    await cpy(`${fixtureDir}/test_2.js`, fixtureDir, { rename: 'test.js' })
    await add(`${fixtureDir}/test.js`, dist)

    delete require.cache[require.resolve(`${dist}/test.js`)]

    // eslint-disable-next-line import/no-dynamic-require, node/global-require
    const func2 = require(`${dist}/test.js`)

    t.is(func1(), 'one')
    t.is(func2(), 'two')
  } finally {
    await cpy(`${fixtureDir}/test.js.backup`, fixtureDir, { rename: 'test.js' })
    await del(`${fixtureDir}/test.js.backup`, { force: true })
    await removeDist(dist)
  }
})

test('Should allow "fail" option to customize failures', async (t) => {
  const fail = spy()
  await add(undefined, undefined, { fail })
  t.true(fail.calledOnce)
  t.is(typeof fail.firstCall.firstArg, 'string')
})

const normalizeFiles = function (fixtureDir, { name, mainFile, runtime, extension, srcFile }) {
  const mainFileA = normalize(`${fixtureDir}/${mainFile}`)
  const srcFileA = srcFile === undefined ? {} : { srcFile: normalize(`${fixtureDir}/${srcFile}`) }
  return { name, mainFile: mainFileA, runtime, extension, ...srcFileA }
}

test('Can list function main files with list()', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/list`
  const functions = await list(fixtureDir)
  t.deepEqual(
    sortOn(functions, ['mainFile', 'extension']),
    [
      { name: 'four', mainFile: 'four.js/four.js.js', runtime: 'js', extension: '.js' },
      { name: 'one', mainFile: 'one/index.js', runtime: 'js', extension: '.js' },
      { name: 'test', mainFile: 'test', runtime: 'go', extension: '' },
      { name: 'test', mainFile: 'test.js', runtime: 'js', extension: '.js' },
      { name: 'test', mainFile: 'test.zip', runtime: 'js', extension: '.zip' },
      { name: 'two', mainFile: 'two/two.js', runtime: 'js', extension: '.js' },
    ].map(normalizeFiles.bind(null, fixtureDir)),
  )
})

test('Can list all function files with listAll()', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/list`
  const functions = await listAll(fixtureDir)
  t.deepEqual(
    sortOn(functions, ['mainFile', 'extension']),
    [
      {
        name: 'four',
        mainFile: 'four.js/four.js.js',
        runtime: 'js',
        extension: '.js',
        srcFile: 'four.js/four.js.js',
      },
      { name: 'one', mainFile: 'one/index.js', runtime: 'js', extension: '.js', srcFile: 'one/index.js' },
      { name: 'test', mainFile: 'test', runtime: 'go', extension: '', srcFile: 'test' },
      { name: 'test', mainFile: 'test.js', runtime: 'js', extension: '.js', srcFile: 'test.js' },
      { name: 'test', mainFile: 'test.zip', runtime: 'js', extension: '.zip', srcFile: 'test.zip' },
      { name: 'two', mainFile: 'two/two.js', runtime: 'js', extension: '.js', srcFile: 'two/three.js' },
      { name: 'two', mainFile: 'two/two.js', runtime: 'js', extension: '.js', srcFile: 'two/two.js' },
    ].map(normalizeFiles.bind(null, fixtureDir)),
  )
})
