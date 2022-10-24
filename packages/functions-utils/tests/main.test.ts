import { rm } from 'fs/promises'
import { normalize } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import cpy from 'cpy'
import { pathExists } from 'path-exists'
import sortOn from 'sort-on'
import { expect, test, vi } from 'vitest'

import { add, list, listAll } from '../src/main.js'

import { getDist, createDist } from './helpers/main.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('Should copy a source file to a dist directory', async () => {
  const dist = await getDist()
  try {
    await add(`${FIXTURES_DIR}/file/test.mjs`, dist)
    expect(await pathExists(`${dist}/test.mjs`)).toBe(true)
  } finally {
    await rm(dist, { force: true, recursive: true })
  }
})

test('Should copy a source directory to a dist directory', async () => {
  const dist = await getDist()
  try {
    await add(`${FIXTURES_DIR}/directory/test`, dist)
    expect(await pathExists(`${dist}/test/index.js`)).toBe(true)
  } finally {
    await rm(dist, { force: true, recursive: true })
  }
})

test('Should throw when source is undefined', async () => {
  const dist = await getDist()
  try {
    await expect(() => add(undefined, dist)).rejects.toThrow()
  } finally {
    await rm(dist, { force: true, recursive: true })
  }
})

test('Should throw when source is empty array', async () => {
  const dist = await getDist()
  try {
    await expect(() => add([] as any, dist)).rejects.toThrow()
  } finally {
    await rm(dist, { force: true, recursive: true })
  }
})

test('Should throw when source points to non-existing file', async () => {
  const dist = await getDist()
  try {
    await expect(() => add(`${FIXTURES_DIR}/file/doesNotExist.js`, dist)).rejects.toThrow()
  } finally {
    await rm(dist, { force: true, recursive: true })
  }
})

test('Should throw when dist is undefined', async () => {
  await expect(() => add(`${FIXTURES_DIR}/file/test.mjs`)).rejects.toThrow()
})

test('Should copy a source file even if dist directory already exists', async () => {
  const dist = await createDist()
  try {
    await add(`${FIXTURES_DIR}/file/test.mjs`, dist)
    expect(await pathExists(`${dist}/test.mjs`)).toBe(true)
  } finally {
    await rm(dist, { force: true, recursive: true })
  }
})

test('Should overwrite dist file if it already exists', async () => {
  const dist = await getDist()
  const fixtureDir = `${FIXTURES_DIR}/file`

  await cpy(`${fixtureDir}/test.mjs`, fixtureDir, { rename: 'test.mjs.backup' })

  try {
    await add(`${fixtureDir}/test.mjs`, dist)

    const { func1 } = await import(`${pathToFileURL(`${dist}/test.mjs`).href}?one`)

    await cpy(`${fixtureDir}/test_2.mjs`, fixtureDir, { rename: 'test.mjs' })
    await add(`${fixtureDir}/test.mjs`, dist)

    const { func2 } = await import(`${pathToFileURL(`${dist}/test.mjs`).href}?two`)

    expect(func1()).toBe('one')
    expect(func2()).toBe('two')
  } finally {
    await cpy(`${fixtureDir}/test.mjs.backup`, fixtureDir, { rename: 'test.mjs' })
    await rm(`${fixtureDir}/test.mjs.backup`, { force: true })
    await rm(dist, { force: true, recursive: true })
  }
})

test('Should allow "fail" option to customize failures', async () => {
  const fail = vi.fn() as any
  await add(undefined, undefined, { fail })
  expect(fail).toHaveBeenCalledOnce()
  expect(fail).toHaveBeenCalledWith('No function source directory was specified')
})

const normalizeFiles = function (fixtureDir, { name, mainFile, runtime, extension, srcFile, schedule }) {
  const mainFileA = normalize(`${fixtureDir}/${mainFile}`)
  const srcFileA = srcFile === undefined ? {} : { srcFile: normalize(`${fixtureDir}/${srcFile}`) }
  return { name, mainFile: mainFileA, runtime, extension, schedule, ...srcFileA }
}

test('Can list function main files with list()', async () => {
  const fixtureDir = `${FIXTURES_DIR}/list`
  const functions = await list(fixtureDir)
  expect(sortOn(functions, ['mainFile', 'extension'])).toEqual(
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

test('Can list all function files with listAll()', async () => {
  const fixtureDir = `${FIXTURES_DIR}/list`
  const functions = await listAll(fixtureDir)
  expect(sortOn(functions, ['mainFile', 'extension'])).toEqual(
    [
      {
        name: 'four',
        mainFile: 'four.js/four.js.js',
        runtime: 'js',
        extension: '.js',
        srcFile: 'four.js/four.js.js',
      },
      {
        name: 'four',
        mainFile: 'four.js/four.js.js',
        runtime: 'js',
        extension: '.json',
        srcFile: '../../../package.json',
      },
      { name: 'one', mainFile: 'one/index.js', runtime: 'js', extension: '.js', srcFile: 'one/index.js' },
      {
        name: 'one',
        mainFile: 'one/index.js',
        runtime: 'js',
        extension: '.json',
        srcFile: '../../../package.json',
      },
      { name: 'test', mainFile: 'test', runtime: 'go', extension: '', srcFile: 'test' },
      { name: 'test', mainFile: 'test.js', runtime: 'js', extension: '.js', srcFile: 'test.js' },
      {
        name: 'test',
        mainFile: 'test.js',
        runtime: 'js',
        extension: '.json',
        srcFile: '../../../package.json',
      },
      { name: 'test', mainFile: 'test.zip', runtime: 'js', extension: '.zip', srcFile: 'test.zip' },
      { name: 'two', mainFile: 'two/two.js', runtime: 'js', extension: '.js', srcFile: 'two/two.js' },
      { name: 'two', mainFile: 'two/two.js', runtime: 'js', extension: '.js', srcFile: 'two/three.js' },
      {
        name: 'two',
        mainFile: 'two/two.js',
        runtime: 'js',
        extension: '.json',
        srcFile: '../../../package.json',
      },
    ].map(normalizeFiles.bind(null, fixtureDir)),
  )
})
