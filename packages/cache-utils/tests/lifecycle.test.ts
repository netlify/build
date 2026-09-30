import { promises as fs } from 'node:fs'
import { join } from 'node:path'

import { expect, test, vi } from 'vitest'

import { has, restore, save } from '../src/main.js'

import { createTmpDir, removeFiles } from './helpers/main.js'

test('Should replace a saved directory when files change or disappear', async () => {
  const [cacheDir, cwd] = await Promise.all([createTmpDir(), createTmpDir()])
  const output = join(cwd, 'output')
  const options = { cacheDir, cwd }
  try {
    await fs.mkdir(output)
    await fs.writeFile(join(output, 'current'), 'first build')
    await fs.writeFile(join(output, 'obsolete'), 'removed in the next build')
    expect(await save('output', options)).toBe(true)

    await fs.writeFile(join(output, 'current'), 'second build')
    await fs.rm(join(output, 'obsolete'))
    await fs.writeFile(join(output, 'added'), 'new file')
    expect(await save('output', options)).toBe(true)
    await fs.rm(output, { recursive: true })

    expect(await restore('output', options)).toBe(true)
    expect((await fs.readdir(output)).sort()).toEqual(['added', 'current'])
    expect(await fs.readFile(join(output, 'current'), 'utf8')).toBe('second build')
    expect(await fs.readFile(join(output, 'added'), 'utf8')).toBe('new file')
  } finally {
    await removeFiles([cacheDir, cwd])
  }
})

test('Should replace a restored directory without changing its siblings or consuming the cache', async () => {
  const [cacheDir, cwd] = await Promise.all([createTmpDir(), createTmpDir()])
  const output = join(cwd, 'output')
  const options = { cacheDir, cwd }
  try {
    await fs.mkdir(output)
    await fs.writeFile(join(output, 'current'), 'cached build')
    await fs.writeFile(join(cwd, 'sibling'), 'keep me')
    expect(await save('output', options)).toBe(true)

    for (let attempt = 0; attempt < 2; attempt++) {
      await fs.writeFile(join(output, 'current'), 'local build')
      await fs.mkdir(join(output, 'stale'))
      await fs.writeFile(join(output, 'stale', 'file'), 'not in the cache')

      expect(await restore('output', options)).toBe(true)
      expect(await fs.readdir(output)).toEqual(['current'])
      expect(await fs.readFile(join(output, 'current'), 'utf8')).toBe('cached build')
      expect(await fs.readFile(join(cwd, 'sibling'), 'utf8')).toBe('keep me')
      expect(await has('output', options)).toBe(true)
    }
  } finally {
    await removeFiles([cacheDir, cwd])
  }
})

test.each([false, true])('Should preserve local files when an expired cache is restored with move=%s', async (move) => {
  const [cacheDir, cwd] = await Promise.all([createTmpDir(), createTmpDir()])
  const output = join(cwd, 'output')
  const options = { cacheDir, cwd }
  const now = vi.spyOn(Date, 'now').mockReturnValue(1_000)
  try {
    await fs.mkdir(output)
    await fs.writeFile(join(output, 'current'), 'expired build')
    expect(await save('output', { ...options, ttl: 1 })).toBe(true)
    await fs.writeFile(join(output, 'current'), 'local build')
    await fs.writeFile(join(output, 'added'), 'keep me')
    now.mockReturnValue(2_001)

    expect(await has('output', options)).toBe(false)
    expect(await restore('output', { ...options, move })).toBe(false)
    expect((await fs.readdir(output)).sort()).toEqual(['added', 'current'])
    expect(await fs.readFile(join(output, 'current'), 'utf8')).toBe('local build')
    expect(await fs.readFile(join(output, 'added'), 'utf8')).toBe('keep me')
  } finally {
    now.mockRestore()
    await removeFiles([cacheDir, cwd])
  }
})

test('Should preserve local files when the cache manifest cannot be read', async () => {
  const [cacheDir, cwd] = await Promise.all([createTmpDir(), createTmpDir()])
  const output = join(cwd, 'output')
  const options = { cacheDir, cwd }
  try {
    await fs.writeFile(output, 'cached build')
    expect(await save('output', options)).toBe(true)
    await fs.writeFile(output, 'local build')
    await fs.writeFile(join(cacheDir, 'cwd', 'output.netlify.cache.json'), '{')

    await expect(restore('output', options)).rejects.toThrow(SyntaxError)
    expect(await fs.readFile(output, 'utf8')).toBe('local build')
  } finally {
    await removeFiles([cacheDir, cwd])
  }
})
