import { readdir } from 'fs/promises'
import { platform } from 'os'
import { join, sep } from 'path'

import decompress from 'decompress'
import { dir as getTmpDir } from 'tmp-promise'
import { expect, test } from 'vitest'

import { ARCHIVE_FORMAT, zipFunction } from '../src/main.js'

import { FIXTURES_ESM_DIR } from './helpers/main.js'

/** Small helper function, reading a directory recursively and returning a record with the files and if it is a symlink or not */
const readDirWithType = async (dir: string, readFiles?: Record<string, boolean>, parent = '') => {
  const files: Record<string, boolean> = readFiles || {}
  const dirents = await readdir(dir, { withFileTypes: true })

  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      await readDirWithType(join(dir, dirent.name), files, join(parent, dirent.name))
    } else {
      files[join(parent, dirent.name)] = dirent.isSymbolicLink()
    }
  }

  return files
}

test.skipIf(platform() === 'win32')('Symlinked directories from `includedFiles` are preserved', async () => {
  const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
  const basePath = join(FIXTURES_ESM_DIR, 'symlinked-included-files')
  const mainFile = join(basePath, 'function.mjs')

  // assert on the source files
  expect(await readDirWithType(basePath)).toEqual({
    'function.mjs': false,
    [join('node_modules/.pnpm/crazy-dep/package.json')]: false,
    [join('node_modules/crazy-dep')]: true,
  })

  const result = await zipFunction(mainFile, tmpDir, {
    archiveFormat: ARCHIVE_FORMAT.ZIP,
    basePath,
    config: {
      '*': {
        includedFiles: ['**'],
      },
    },
    repositoryRoot: basePath,
    systemLog: console.log,
    debug: true,
  })

  const unzippedPath = join(tmpDir, 'extracted')
  await decompress(result!.path, unzippedPath)

  // expect that the symlink for `node_modules/crazy-dep` is preserved
  expect(await readDirWithType(unzippedPath)).toEqual({
    '___netlify-bootstrap.mjs': false,
    '___netlify-entry-point.mjs': false,
    '___netlify-telemetry.mjs': false,
    '___netlify-metadata.json': false,
    'function.mjs': false,
    [join('node_modules/.pnpm/crazy-dep/package.json')]: false,
    [join('node_modules/crazy-dep')]: true,
  })
})

// Regression test for https://github.com/netlify/build/pull/5836
test('preserves multiple symlinks that link to the same target', async () => {
  const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
  const basePath = join(FIXTURES_ESM_DIR, 'symlinked-deps')
  const mainFile = join(basePath, 'function.mjs')

  // Two symlinks that point at `node_modules/.pnpm/is-odd@1.0.0/node_modules/is-odd`:
  //
  // - `node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-odd`
  // - `node_modules/.pnpm/is-even@1.0.0/node_modules/is-odd`
  expect(await readDirWithType(basePath)).toEqual({
    'function.mjs': false,
    ['node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-even'.replace(/\//g, sep)]: true,
    ['node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-even-or-odd/index.js'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-even-or-odd/package.json'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-odd'.replace(/\//g, sep)]: true,
    ['node_modules/.pnpm/is-even@1.0.0/node_modules/is-even/index.js'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-even@1.0.0/node_modules/is-even/package.json'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-even@1.0.0/node_modules/is-odd'.replace(/\//g, sep)]: true,
    ['node_modules/.pnpm/is-odd@1.0.0/node_modules/is-odd/index.js'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-odd@1.0.0/node_modules/is-odd/package.json'.replace(/\//g, sep)]: false,
    ['node_modules/is-even-or-odd'.replace(/\//g, sep)]: true,
  })

  await zipFunction(mainFile, tmpDir, {
    archiveFormat: ARCHIVE_FORMAT.NONE,
    basePath,
    config: {
      '*': {
        includedFiles: ['**'],
      },
    },
    repositoryRoot: basePath,
    systemLog: console.log,
    debug: true,
  })

  // Test to be sure we've made both symlinks, not just one of them
  expect(await readDirWithType(join(tmpDir, 'function'))).toEqual({
    '___netlify-bootstrap.mjs': false,
    '___netlify-entry-point.mjs': false,
    '___netlify-telemetry.mjs': false,
    'function.mjs': false,
    ['node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-even'.replace(/\//g, sep)]: true,
    ['node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-even-or-odd/index.js'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-even-or-odd/package.json'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-even-or-odd@1.0.0/node_modules/is-odd'.replace(/\//g, sep)]: true,
    ['node_modules/.pnpm/is-even@1.0.0/node_modules/is-even/index.js'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-even@1.0.0/node_modules/is-even/package.json'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-even@1.0.0/node_modules/is-odd'.replace(/\//g, sep)]: true,
    ['node_modules/.pnpm/is-odd@1.0.0/node_modules/is-odd/index.js'.replace(/\//g, sep)]: false,
    ['node_modules/.pnpm/is-odd@1.0.0/node_modules/is-odd/package.json'.replace(/\//g, sep)]: false,
    ['node_modules/is-even-or-odd'.replace(/\//g, sep)]: true,
  })
})

test('symlinks in subdir of `includedFiles` are copied over successfully', async () => {
  const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
  const basePath = join(FIXTURES_ESM_DIR, 'symlinked-bin')
  const mainFile = join(basePath, 'function.ts')

  // assert on the source files
  expect(await readDirWithType(basePath)).toEqual({
    'function.ts': false,
    [join('subproject/node_modules/.bin/cli.js')]: true,
    [join('subproject/node_modules/tool/cli.js')]: false,
  })

  await zipFunction(mainFile, tmpDir, {
    archiveFormat: ARCHIVE_FORMAT.NONE,
    basePath,
    config: {
      '*': {
        includedFiles: ['subproject/**'],
      },
    },
    repositoryRoot: basePath,
    systemLog: console.log,
    debug: true,
  })

  expect(await readDirWithType(join(tmpDir, 'function'))).toEqual({
    '___netlify-bootstrap.mjs': false,
    '___netlify-entry-point.mjs': false,
    '___netlify-telemetry.mjs': false,
    'function.cjs': false,
    [join('subproject/node_modules/.bin/cli.js')]: true,
    [join('subproject/node_modules/tool/cli.js')]: false,
  })
})
