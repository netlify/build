import { readFile, mkdir } from 'fs/promises'
import { join } from 'path'

import { execa } from 'execa'
import { dir as getTmpDir } from 'tmp-promise'
import { describe, expect, test } from 'vitest'

import { zipFunction } from '../src/main.js'

import { FIXTURES_DIR, FIXTURES_ESM_DIR } from './helpers/main.js'

describe('Netlify Play', () => {
  test('Creates tar.gz archive without bootstrap', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
    const mainFile = join(FIXTURES_ESM_DIR, 'netlify-play', 'function-netlify-play.mjs')

    const result = await zipFunction(mainFile, tmpDir, {
      featureFlags: {
        zisi_netlify_play: true,
      },
    })

    expect(result).not.toBeUndefined()

    const extractDir = join(tmpDir, 'extracted')
    await mkdir(extractDir, { recursive: true })
    await execa('tar', ['-xzf', result!.path, '-C', extractDir])

    const entryFileContent = await readFile(join(extractDir, '___netlify-entry-point.mjs'), 'utf8')
    expect(entryFileContent).toMatch(/export \* from ['"]\.\//)
    expect(entryFileContent).not.toContain('bootstrap')
  })

  test('Creates a regular zip when zisi_netlify_play is disabled', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
    const mainFile = join(FIXTURES_ESM_DIR, 'netlify-play', 'function-netlify-play.mjs')

    const result = await zipFunction(mainFile, tmpDir, {
      featureFlags: {
        zisi_netlify_play: false,
      },
    })

    expect(result).not.toBeUndefined()
    expect(result!.path.endsWith('.zip')).toBeTruthy()
  })

  test('Creates a regular zip when function does not end with -netlify-play', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
    const mainFile = join(FIXTURES_DIR, 'simple', 'function.js')

    const result = await zipFunction(mainFile, tmpDir, {
      featureFlags: {
        zisi_netlify_play: true,
      },
    })

    expect(result).not.toBeUndefined()
    expect(result!.path.endsWith('.zip')).toBeTruthy()
  })
})
