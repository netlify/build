import type { Stats } from 'fs'

import { describe, expect, test } from 'vitest'

import { excludeShadowingSymlinks } from '../../../../../src/runtimes/node/utils/zip.js'

const entry = (destPath: string, symlink = false) => ({
  srcFile: `/src/${destPath}`,
  destPath,
  stat: { isSymbolicLink: () => symlink } as Stats,
})

const destPaths = (files: { destPath: string }[]) => files.map(({ destPath }) => destPath)

describe('excludeShadowingSymlinks', () => {
  test('drops a symlinked package that other entries sit beneath', () => {
    const files = [
      entry('index.js'),
      entry('node_modules/pdf-parse', true),
      entry('node_modules/pdf-parse/dist/worker.mjs'),
    ]

    expect(destPaths(excludeShadowingSymlinks(files))).toStrictEqual([
      'index.js',
      'node_modules/pdf-parse/dist/worker.mjs',
    ])
  })

  test('drops a symlinked node_modules that is also populated', () => {
    const files = [entry('index.js'), entry('node_modules', true), entry('node_modules/left-pad/index.js')]

    expect(destPaths(excludeShadowingSymlinks(files))).toStrictEqual(['index.js', 'node_modules/left-pad/index.js'])
  })

  test('drops the symlink when it is listed after the entries it shadows', () => {
    const files = [entry('node_modules/sharp/build/sharp.node'), entry('node_modules/sharp', true)]

    expect(destPaths(excludeShadowingSymlinks(files))).toStrictEqual(['node_modules/sharp/build/sharp.node'])
  })

  test('keeps symlinks that shadow nothing', () => {
    const files = [
      entry('index.js'),
      entry('.next/node_modules/better-sqlite3', true),
      entry('node_modules/better-sqlite3/index.js'),
    ]

    expect(destPaths(excludeShadowingSymlinks(files))).toStrictEqual(destPaths(files))
  })

  test('keeps a symlink whose name is only a prefix of another path', () => {
    const files = [entry('lib', true), entry('library/index.js')]

    expect(destPaths(excludeShadowingSymlinks(files))).toStrictEqual(destPaths(files))
  })

  test('returns the list untouched when there are no symlinks', () => {
    const files = [entry('index.js'), entry('node_modules/left-pad/index.js')]

    expect(excludeShadowingSymlinks(files)).toStrictEqual(files)
  })
})
