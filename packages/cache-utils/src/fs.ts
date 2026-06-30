import { promises as fs, Stats } from 'node:fs'
import { basename } from 'node:path'

import { isNotJunk } from 'junk'
import { moveFile } from 'move-file'

/**
 * Move or copy a cached file/directory from/to a local one
 * @param src The src directory or file to cache
 * @param dest The destination location
 * @param move If the file should be moved, moving is faster but removes the source files locally
 */
export const moveCacheFile = async function (src: string, dest: string, move = false) {
  // Moving is faster but removes the source files locally
  if (move) {
    return moveFile(src, dest, { overwrite: false })
  }

  if ((await getStat(src)) === undefined) {
    return
  }

  await fs.cp(src, dest, { recursive: true, force: false, errorOnExist: false })
}

/**
 * Non-existing files and empty directories are always skipped
 */
export const hasFiles = async function (src: string): Promise<boolean> {
  const stat = await getStat(src)
  if (stat === undefined) {
    return false
  }
  if (!stat.isDirectory()) {
    return isNotJunk(basename(src))
  }
  const files = await fs.readdir(src, {
    recursive: true,
    withFileTypes: true,
  })
  return files.some((entry) => !entry.isDirectory() && isNotJunk(entry.name))
}

const getStat = async (src: string): Promise<Stats | undefined> => {
  try {
    return await fs.stat(src)
  } catch {
    // continue regardless error
    return undefined
  }
}
