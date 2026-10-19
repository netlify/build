import type { Stats } from 'fs'
import { symlinkSync, writeFileSync } from 'fs'
import { join } from 'path'

import { dir as getTmpDir } from 'tmp-promise'
import { describe, expect, test, vi } from 'vitest'

import { addZipFile } from '../../src/archive.js'

describe('addZipFile', () => {
  test('pins date to 0 for symbolic links for deterministic archives', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-symlink-test' })
    const targetFile = join(tmpDir, 'target.txt')
    const linkFile = join(tmpDir, 'link.txt')
    writeFileSync(targetFile, 'content')
    try {
      symlinkSync(targetFile, linkFile)
    } catch {
      // Windows non-elevated environments might not allow creating symlinks
      return
    }

    const appendSpy = vi.fn()
    const mockArchive = { append: appendSpy } as any
    const mockStat = {
      isSymbolicLink: () => true,
      mode: 0o777,
    } as unknown as Stats

    addZipFile(mockArchive, linkFile, 'link-name', mockStat)

    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        name: 'link-name',
        type: 'symlink',
        linkname: targetFile,
        mode: 0o777,
        date: new Date(0),
      }),
    )
  })
})
