import { readFile, rm } from 'fs/promises'
import { normalize, resolve } from 'path'
import { fileURLToPath } from 'url'

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
  const testModule = `${dist}/test.mjs`

  await cpy(`${fixtureDir}/test.mjs`, fixtureDir, { rename: 'test.mjs.backup' })

  try {
    await add(`${fixtureDir}/test.mjs`, dist)

    const file1 = await readFile(testModule, 'utf8')

    await cpy(`${fixtureDir}/test_2.mjs`, fixtureDir, { rename: 'test.mjs' })
    await add(`${fixtureDir}/test.mjs`, dist)

    const file2 = await readFile(testModule, 'utf8')

    expect(file1).toContain('one')
    expect(file2).toContain('two')
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

const normalizeFiles = function (fixtureDir, { name, mainFile, runtime, extension, srcDir, srcFile, schedule }) {
  const mainFileA = normalize(`${fixtureDir}/${mainFile}`)
  const srcFileA = srcFile === undefined ? {} : { srcFile: normalize(`${fixtureDir}/${srcFile}`) }
  const srcDirA = srcDir ? { srcDir: resolve(fixtureDir, srcDir) } : {}
  return { name, mainFile: mainFileA, runtime, extension, schedule, ...srcFileA, ...srcDirA }
}

test('Can list function main files with list()', async () => {
  const fixtureDir = `${FIXTURES_DIR}/list`
  const functions = await list(fixtureDir)
  expect(sortOn(functions, ['mainFile', 'extension'])).toEqual(
    [
      { name: 'four', mainFile: 'four.js/four.js.js', runtime: 'js', extension: '.js', srcDir: 'four.js' },
      {
        name: 'one',
        mainFile: 'one/index.js',
        runtime: 'js',
        extension: '.js',
        srcDir: 'one',
      },
      { name: 'test', mainFile: 'test', runtime: 'go', extension: '', srcDir: '.' },
      { name: 'test', mainFile: 'test.js', runtime: 'js', extension: '.js', srcDir: '.' },
      { name: 'test', mainFile: 'test.zip', runtime: 'js', extension: '.zip', srcDir: '.' },
      { name: 'two', mainFile: 'two/two.js', runtime: 'js', extension: '.js', srcDir: 'two' },
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
        srcDir: 'four.js',
      },
      {
        name: 'four',
        mainFile: 'four.js/four.js.js',
        runtime: 'js',
        extension: '.json',
        srcFile: '../../../package.json',
        srcDir: 'four.js',
      },
      {
        name: 'one',
        mainFile: 'one/index.js',
        runtime: 'js',
        extension: '.js',
        srcFile: 'one/index.js',
        srcDir: 'one',
      },
      {
        name: 'one',
        mainFile: 'one/index.js',
        runtime: 'js',
        extension: '.json',
        srcFile: '../../../package.json',
        srcDir: 'one',
      },
      {
        name: 'test',
        mainFile: 'test',
        runtime: 'go',
        extension: '',
        srcFile: 'test',
        srcDir: '.',
      },
      {
        name: 'test',
        mainFile: 'test.js',
        runtime: 'js',
        extension: '.js',
        srcFile: 'test.js',
        srcDir: '.',
      },
      {
        name: 'test',
        mainFile: 'test.js',
        runtime: 'js',
        extension: '.json',
        srcFile: '../../../package.json',
        srcDir: '.',
      },
      {
        name: 'test',
        mainFile: 'test.zip',
        runtime: 'js',
        extension: '.zip',
        srcFile: 'test.zip',
        srcDir: '.',
      },
      { name: 'two', mainFile: 'two/two.js', runtime: 'js', extension: '.js', srcFile: 'two/two.js', srcDir: 'two' },
      { name: 'two', mainFile: 'two/two.js', runtime: 'js', extension: '.js', srcFile: 'two/three.js', srcDir: 'two' },
      {
        name: 'two',
        mainFile: 'two/two.js',
        runtime: 'js',
        extension: '.json',
        srcFile: '../../../package.json',
        srcDir: 'two',
      },
    ].map(normalizeFiles.bind(null, fixtureDir)),
  )
})
