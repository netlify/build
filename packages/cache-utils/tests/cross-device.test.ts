import { promises as fs } from 'node:fs'
import { join } from 'node:path'

import { expect, test, vi } from 'vitest'

import { moveCacheFile } from '../src/fs.js'
import { has, restore, save } from '../src/main.js'

import { createTmpDir, removeFiles } from './helpers/main.js'

test('Should save and restore a directory when a move crosses devices', async () => {
  const [cacheDir, cwd] = await Promise.all([createTmpDir(), createTmpDir()])
  const output = join(cwd, 'output')
  const options = { cacheDir, cwd, move: true }
  const contents = Buffer.from([0, 255, 1, 128])
  vi.spyOn(fs, 'rename').mockRejectedValue(Object.assign(new Error('cross-device move'), { code: 'EXDEV' }))
  try {
    await fs.mkdir(join(output, 'nested'), { recursive: true })
    await fs.writeFile(join(output, 'nested', 'data'), contents)

    expect(await save('output', options)).toBe(true)
    await expect(fs.stat(output)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await has('output', options)).toBe(true)
    expect(await restore('output', options)).toBe(true)
    expect(await fs.readFile(join(output, 'nested', 'data'))).toEqual(contents)
    expect(await has('output', options)).toBe(false)
    expect(await restore('output', options)).toBe(false)
    expect(await fs.readFile(join(output, 'nested', 'data'))).toEqual(contents)
  } finally {
    await removeFiles([cacheDir, cwd])
  }
})

test('Should preserve the source when a cross-device copy fails', async () => {
  const cwd = await createTmpDir()
  const src = join(cwd, 'source')
  const dest = join(cwd, 'destination')
  const failure = Object.assign(new Error('copy failed'), { code: 'ENOSPC' })
  const copy = fs.cp.bind(fs)
  vi.spyOn(fs, 'rename').mockRejectedValue(Object.assign(new Error('cross-device move'), { code: 'EXDEV' }))
  vi.spyOn(fs, 'cp').mockImplementationOnce(async () => {
    // A full disk can leave a partial destination behind.
    await fs.mkdir(dest)
    await fs.writeFile(join(dest, 'data'), 'partial')
    throw failure
  })
  try {
    await fs.mkdir(src)
    await fs.writeFile(join(src, 'data'), 'complete source')

    await expect(moveCacheFile(src, dest, true)).rejects.toBe(failure)
    expect(await fs.readFile(join(src, 'data'), 'utf8')).toBe('complete source')

    await fs.rm(dest, { recursive: true, force: true })
    vi.mocked(fs.cp).mockImplementation(copy)
    await moveCacheFile(src, dest, true)
    expect(await fs.readFile(join(dest, 'data'), 'utf8')).toBe('complete source')
    await expect(fs.stat(src)).rejects.toMatchObject({ code: 'ENOENT' })
  } finally {
    await removeFiles(cwd)
  }
})

test('Should propagate other rename errors without copying or removing the source', async () => {
  const cwd = await createTmpDir()
  const src = join(cwd, 'source')
  const dest = join(cwd, 'destination')
  const failure = Object.assign(new Error('rename denied'), { code: 'EACCES' })
  const copy = vi.spyOn(fs, 'cp')
  vi.spyOn(fs, 'rename').mockRejectedValue(failure)
  try {
    await fs.writeFile(src, 'keep me')

    await expect(moveCacheFile(src, dest, true)).rejects.toBe(failure)
    expect(await fs.readFile(src, 'utf8')).toBe('keep me')
    await expect(fs.stat(dest)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(copy).not.toHaveBeenCalled()
  } finally {
    await removeFiles(cwd)
  }
})

test('Should refuse to move onto an existing destination', async () => {
  const cwd = await createTmpDir()
  const src = join(cwd, 'source')
  const dest = join(cwd, 'destination')
  const rename = vi.spyOn(fs, 'rename')
  try {
    await fs.writeFile(src, 'source contents')
    await fs.writeFile(dest, 'destination contents')

    await expect(moveCacheFile(src, dest, true)).rejects.toThrow('The destination file exists:')
    expect(await fs.readFile(src, 'utf8')).toBe('source contents')
    expect(await fs.readFile(dest, 'utf8')).toBe('destination contents')
    expect(rename).not.toHaveBeenCalled()
  } finally {
    await removeFiles(cwd)
  }
})
