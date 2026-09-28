import { promises as fs, Stats } from 'node:fs'
import { basename, dirname } from 'node:path'

import { isNotJunk } from 'junk'

/**
 * Move or copy a cached file/directory from/to a local one
 * @param src The src directory or file to cache
 * @param dest The destination location
 * @param move If the file should be moved, moving is faster but removes the source files locally
 */
export const moveCacheFile = async function (src: string, dest: string, move = false) {
  // Moving is faster but removes the source files locally
  if (move) {
    try {
      await fs.access(dest)
      throw new Error(`The destination file exists: ${dest}`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }

    await fs.mkdir(dirname(dest), { recursive: true })

    try {
      await fs.rename(src, dest)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EXDEV') {
        throw error
      }
      // Only happens when moving cross-device
      await fs.cp(src, dest, { recursive: true, force: false, errorOnExist: true })
      await fs.rm(src, { recursive: true, force: true })
    }
    return
  }

  if ((await getStat(src)) === undefined) {
    return
  }

  await fs.cp(src, dest, {
    recursive: true,
    force: false,
    errorOnExist: false,
    filter: (source) => isNotJunk(basename(source)),
  })
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
