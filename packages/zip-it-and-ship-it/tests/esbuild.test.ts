import { build } from 'esbuild'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { ARCHIVE_FORMAT } from '../src/archive.js'
import { NODE_BUNDLER } from '../src/runtimes/node/bundlers/types.js'

import { zipFixture } from './helpers/main.js'
import { computeSha1 } from './helpers/sha.js'

import 'source-map-support/register'

// Shared state used by the `src_files` mock below to optionally reverse the
// order in which source files are discovered, simulating the run-to-run
// filesystem traversal variance that happens across build environments.
const { srcFilesOrder } = vi.hoisted(() => ({ srcFilesOrder: { reverse: false } }))

vi.mock('../src/utils/shell.js', () => ({ shellUtils: { runCommand: vi.fn() } }))

vi.mock('esbuild', async () => {
  const esbuild = await vi.importActual<any>('esbuild')

  return {
    ...esbuild,
    build: vi.fn(esbuild.build),
  }
})

// Wraps the real `getSrcFiles` so a test can flip the discovery order without
// touching the filesystem. With `reverse` disabled (the default) the behaviour
// is identical to the real module, so other tests are unaffected.
vi.mock('../src/runtimes/node/bundlers/esbuild/src_files.js', async () => {
  const actual = await vi.importActual<typeof import('../src/runtimes/node/bundlers/esbuild/src_files.js')>(
    '../src/runtimes/node/bundlers/esbuild/src_files.js',
  )

  const getSrcFiles: typeof actual.getSrcFiles = async (options) => {
    const result = await actual.getSrcFiles(options)

    return srcFilesOrder.reverse ? { ...result, srcFiles: [...result.srcFiles].reverse() } : result
  }

  return { ...actual, getSrcFiles }
})

describe('esbuild', () => {
  afterEach(() => {
    vi.mocked(build).mockReset()
    srcFilesOrder.reverse = false
  })

  test('Generates a bundle for the Node runtime version specified in the `nodeVersion` config property', async () => {
    // Using the optional catch binding feature to assert that the bundle is
    // respecting the Node version supplied.
    // - in Node <10 we should see `try {} catch (e) {}`
    // - in Node >= 10 we should see `try {} catch {}`
    await zipFixture('node-module-optional-catch-binding', {
      opts: {
        archiveFormat: ARCHIVE_FORMAT.NONE,
        config: { '*': { nodeBundler: NODE_BUNDLER.ESBUILD, nodeVersion: '22.x' } },
      },
    })

    expect(build).toHaveBeenCalledWith(expect.objectContaining({ target: ['node22'] }))
  })

  // Netlify content-addresses function uploads, so an unchanged function should
  // produce a byte-identical zip and skip re-uploading. The order in which
  // source files are discovered on disk is not stable across build environments,
  // so the bundler must emit them in a deterministic order — otherwise the zip
  // checksum changes on every build and dedup never hits. The `zisi` and `nft`
  // bundlers already sort their `srcFiles` for this reason; this asserts esbuild
  // does too. See `getSrcFiles` in `runtimes/node/bundlers/esbuild/index.ts`.
  test('Produces a byte-identical zip regardless of the order in which source files are discovered', async () => {
    const opts = {
      archiveFormat: ARCHIVE_FORMAT.ZIP,
      config: { '*': { nodeBundler: NODE_BUNDLER.ESBUILD, externalNodeModules: ['test'] } },
    }

    srcFilesOrder.reverse = false
    const {
      files: [first],
    } = await zipFixture('node-module-and-local-imports', { opts })

    srcFilesOrder.reverse = true
    const {
      files: [second],
    } = await zipFixture('node-module-and-local-imports', { opts })

    expect(await computeSha1(first.path)).toBe(await computeSha1(second.path))
  })
})
