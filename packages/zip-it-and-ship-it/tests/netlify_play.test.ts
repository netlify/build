import { readFile, mkdir } from 'fs/promises'
import { join } from 'path'

import { execa } from 'execa'
import { describe, expect, test } from 'vitest'

import { zipFunction } from '../src/main.js'
import { NETLIFY_PLAY_BOOTSTRAP_VERSION } from '../src/runtimes/node/utils/play.js'

import { FIXTURES_DIR, FIXTURES_ESM_DIR, getTmpDir } from './helpers/main.js'

describe('Netlify Play', () => {
  test('Creates tgz archive without bootstrap and with play bootstrapVersion', async () => {
    const tmpDir = await getTmpDir()
    const mainFile = join(FIXTURES_ESM_DIR, 'netlify-play', 'function-netlify-play.mjs')

    const result = await zipFunction(mainFile, tmpDir, {
      featureFlags: {
        zisi_netlify_play: true,
      },
    })

    expect(result).not.toBeUndefined()
    expect(result!.path).toMatch(/\.tgz$/)
    expect(result!.bootstrapVersion).toBe(NETLIFY_PLAY_BOOTSTRAP_VERSION)

    const extractDir = join(tmpDir, 'extracted')
    await mkdir(extractDir, { recursive: true })
    await execa('tar', ['-xzf', result!.path, '-C', extractDir])

    const entryFileContent = await readFile(join(extractDir, '___netlify-entry-point.mjs'), 'utf8')
    expect(entryFileContent).toMatch(/export \* as func from ['"]\.\//)
    expect(entryFileContent).not.toContain('bootstrap')
  })

  test('Creates a regular zip when zisi_netlify_play is disabled', async () => {
    const tmpDir = await getTmpDir()
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
    const tmpDir = await getTmpDir()
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
