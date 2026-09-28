import type { Stats } from 'fs'

import { describe, expect, test } from 'vitest'

import { resolveSymlinkedDestPaths } from '../../../../../src/runtimes/node/utils/zip.js'

const entry = (destPath: string, symlink = false) => ({
  srcFile: `/repo/${destPath}`,
  destPath,
  stat: { isSymbolicLink: () => symlink } as Stats,
})

const readTargets =
  (links: Record<string, string>, onRead?: (srcFile: string) => void) => async (srcFile: string) => {
    onRead?.(srcFile)

    return links[srcFile.replace('/repo/', '')]
  }

const destPaths = (files: { destPath: string }[]) => files.map(({ destPath }) => destPath)

describe('resolveSymlinkedDestPaths', () => {
  // pnpm keeps the real files in a content store and makes `node_modules/<pkg>`
  // a link to them, so a tracer that reports the path it walked through puts
  // files under a path that the archive also holds as a link.
  test('moves entries walked through a link onto the path the link points at', async () => {
    const files = [
      entry('index.js'),
      entry('node_modules/pdf-parse', true),
      entry('node_modules/pdf-parse/dist/index.cjs'),
      entry('node_modules/.pnpm/pdf-parse@2.4.5/node_modules/pdf-parse/package.json'),
    ]

    const resolved = await resolveSymlinkedDestPaths(files, {
      readTarget: readTargets({ 'node_modules/pdf-parse': '.pnpm/pdf-parse@2.4.5/node_modules/pdf-parse' }),
    })

    expect(destPaths(resolved)).toStrictEqual([
      'index.js',
      'node_modules/pdf-parse',
      'node_modules/.pnpm/pdf-parse@2.4.5/node_modules/pdf-parse/dist/index.cjs',
      'node_modules/.pnpm/pdf-parse@2.4.5/node_modules/pdf-parse/package.json',
    ])
  })

  test('leaves the link itself in place', async () => {
    const files = [entry('node_modules/dep', true), entry('node_modules/dep/index.js')]

    const resolved = await resolveSymlinkedDestPaths(files, {
      readTarget: readTargets({ 'node_modules/dep': '.store/dep' }),
    })

    expect(resolved.find(({ destPath }) => destPath === 'node_modules/dep')?.stat.isSymbolicLink()).toBe(true)
  })

  // Whichever link resolves first must not decide the outcome, or the archive
  // checksum stops being reproducible.
  test('applies the most specific link when one is nested inside another', async () => {
    const files = [
      entry('node_modules/outer', true),
      entry('node_modules/outer/inner', true),
      entry('node_modules/outer/inner/index.js'),
    ]
    const links = { 'node_modules/outer': '.store/outer', 'node_modules/outer/inner': '../.store/inner' }

    const first = await resolveSymlinkedDestPaths(files, { readTarget: readTargets(links) })
    const reversed = await resolveSymlinkedDestPaths([...files].reverse(), { readTarget: readTargets(links) })

    expect(first.map(({ destPath }) => destPath)).toContain('node_modules/.store/inner/index.js')
    expect(reversed.map(({ destPath }) => destPath)).toContain('node_modules/.store/inner/index.js')
  })

  // The link cannot be represented inside the archive, so rewriting entries onto
  // it would move them out of the bundle.
  test('leaves entries alone when the link points outside the bundle', async () => {
    const files = [entry('node_modules', true), entry('node_modules/left-pad/index.js')]

    const resolved = await resolveSymlinkedDestPaths(files, {
      readTarget: readTargets({ node_modules: '/Users/someone/elsewhere/node_modules' }),
    })

    expect(destPaths(resolved)).toStrictEqual(destPaths(files))
  })

  test('leaves entries alone when the target escapes the bundle root', async () => {
    const files = [entry('node_modules/dep', true), entry('node_modules/dep/index.js')]

    const resolved = await resolveSymlinkedDestPaths(files, {
      readTarget: readTargets({ 'node_modules/dep': '../../outside/dep' }),
    })

    expect(destPaths(resolved)).toStrictEqual(destPaths(files))
  })

  test('does not rewrite a path that merely shares a prefix with the link', async () => {
    const files = [entry('lib', true), entry('library/index.js')]

    const resolved = await resolveSymlinkedDestPaths(files, { readTarget: readTargets({ lib: '.store/lib' }) })

    expect(destPaths(resolved)).toStrictEqual(destPaths(files))
  })

  test('keeps one entry when a rewrite lands on a path already present', async () => {
    const files = [
      entry('node_modules/dep', true),
      entry('node_modules/dep/index.js'),
      entry('node_modules/.store/dep/index.js'),
    ]

    const resolved = await resolveSymlinkedDestPaths(files, {
      readTarget: readTargets({ 'node_modules/dep': '.store/dep' }),
    })

    expect(destPaths(resolved)).toStrictEqual(['node_modules/dep', 'node_modules/.store/dep/index.js'])
  })

  // nft patches package.json files into `rewrites`; dropping that entry in
  // favour of an identically-named one would ship the unpatched manifest.
  test('keeps the entry carrying rewritten contents when two land on one path', async () => {
    const patched = entry('node_modules/dep/package.json')
    const files = [entry('node_modules/dep', true), entry('node_modules/.store/dep/package.json'), patched]

    const resolved = await resolveSymlinkedDestPaths(files, {
      readTarget: readTargets({ 'node_modules/dep': '.store/dep' }),
      rewrites: new Map([[patched.srcFile, '{"type":"module"}']]),
    })

    const kept = resolved.find(({ destPath }) => destPath === 'node_modules/.store/dep/package.json')

    expect(kept?.srcFile).toBe(patched.srcFile)
  })

  test('reads no links and returns the list untouched when there are none', async () => {
    const files = [entry('index.js'), entry('node_modules/left-pad/index.js')]

    const resolved = await resolveSymlinkedDestPaths(files, {
      readTarget: async () => {
        throw new Error('should not read any link')
      },
    })

    expect(resolved).toStrictEqual(files)
  })
})
