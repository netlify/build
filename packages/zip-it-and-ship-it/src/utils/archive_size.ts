import { promises as fs } from 'fs'
import { extname } from 'path'

import type { FunctionArchive } from '../function.js'

// Returns the input object with an additional `size` property containing the
// size of the file at `path` when it is a ZIP archive.
export const getArchiveSize = async (path: string) => {
  if (extname(path) !== '.zip') {
    return
  }

  const { size } = await fs.stat(path)

  return size
}

export const addArchiveSize = async (result: FunctionArchive) => {
  const size = await getArchiveSize(result.path)
  return { ...result, size }
}
