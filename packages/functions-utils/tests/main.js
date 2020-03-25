const test = require('ava')
const pathExists = require('path-exists')

const { getDist, createDist, removeDist } = require('./helpers/main')

const { add } = require('..')

const FIXTURES_DIR = `${__dirname}/fixtures`

test('Should copy a source file to a dist directory', async t => {
  const dist = await getDist()
  try {
    await add(`${FIXTURES_DIR}/file/test.js`, dist)
    t.true(await pathExists(`${dist}/test.js`))
  } finally {
    await removeDist(dist)
  }
})

test('Should copy a source directory to a dist directory', async t => {
  const dist = await getDist()
  try {
    await add(`${FIXTURES_DIR}/directory/test`, dist)
    t.true(await pathExists(`${dist}/test/index.js`))
  } finally {
    await removeDist(dist)
  }
})

test('Should throw when source is undefined', async t => {
  const dist = await getDist()
  try {
    await t.throwsAsync(add(undefined, dist))
  } finally {
    await removeDist(dist)
  }
})

test('Should throw when source points to non-existing file', async t => {
  const dist = await getDist()
  try {
    await t.throwsAsync(add(`${FIXTURES_DIR}/file/doesNotExist.js`, dist))
  } finally {
    await removeDist(dist)
  }
})

test('Should throw when dist is undefined', async t => {
  await t.throwsAsync(add(`${FIXTURES_DIR}/file/test.js`))
})

test('Should copy a source file even if dist directory already exists', async t => {
  const dist = await createDist()
  try {
    await add(`${FIXTURES_DIR}/file/test.js`, dist)
    t.true(await pathExists(`${dist}/test.js`))
  } finally {
    await removeDist(dist)
  }
})

test('Should throw if dist file already exists', async t => {
  const dist = await getDist()
  try {
    await add(`${FIXTURES_DIR}/file/test.js`, dist)
    await t.throwsAsync(add(`${FIXTURES_DIR}/file/test.js`, dist))
  } finally {
    await removeDist(dist)
  }
})

test('Should allow "fail" option to customize failures', async t => {
  let failMessage
  const fail = message => {
    failMessage = message
  }
  await add(undefined, undefined, { fail })
  t.is(typeof failMessage, 'string')
})
