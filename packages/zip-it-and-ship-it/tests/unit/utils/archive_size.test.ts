import { resolve } from 'path'

import { describe, expect, test } from 'vitest'

import { FunctionArchive } from '../../../src/function.js'
import { addArchiveSize, getArchiveSize } from '../../../src/utils/archive_size.js'
import { FIXTURES_DIR } from '../../helpers/main.js'

describe('addArchiveSize', () => {
  test('adds the archive size of the file at `path` if it is a ZIP archive', async () => {
    const functionArchive = {
      path: resolve(FIXTURES_DIR, 'archive-size', 'normal.zip'),
    } as FunctionArchive

    const result = await addArchiveSize(functionArchive)

    expect(result.size).toBe(1098)
  })

  test('does not add the archive size of the file at `path` if it is not a ZIP archive', async () => {
    const functionArchive = {
      path: resolve(FIXTURES_DIR, 'archive-size', 'normal.js'),
    } as FunctionArchive

    const result = await addArchiveSize(functionArchive)

    expect(result.size).toBeUndefined()
  })
})

describe('getArchiveSize', () => {
  test('returns the size of the file at `path` when it is a ZIP archive', async () => {
    const size = await getArchiveSize(resolve(FIXTURES_DIR, 'archive-size', 'normal.zip'))

    expect(size).toBe(1098)
  })

  test('returns undefined when the file at `path` is not a ZIP archive', async () => {
    const size = await getArchiveSize(resolve(FIXTURES_DIR, 'archive-size', 'normal.js'))

    expect(size).toBeUndefined()
  })
})
