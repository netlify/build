import { promises as fs } from 'fs'
import { basename, dirname } from 'path'

import cpy from 'cpy'
import { globby } from 'globby'
import { isNotJunk } from 'junk'
import { moveFile } from 'move-file'

/**
 * Move or copy a cached file/directory from/to a local one
 */
export const moveCacheFile = async function (src: string, dest: string, move: boolean) {
  // Moving is faster but removes the source files locally
  if (move) {
    return moveFile(src, dest, { overwrite: false })
  }

  const glob = await getSrcGlob(src)
  if (glob) {
    return cpy(glob.srcGlob, dirname(dest), { cwd: glob.cwd, parents: true, overwrite: false })
  }
}

/**
 * Non-existing files and empty directories are always skipped
 */
export const hasFiles = async function (src: string): Promise<boolean> {
  const glob = await getSrcGlob(src)
  if (!glob) {
    return false
  }

  return glob.srcGlob !== undefined && !(await isEmptyDir({ srcGlob: glob.srcGlob, cwd: glob.cwd, isDir: glob.isDir }))
}

/** Replicates what `cpy` is doing under the hood. */
const isEmptyDir = async function ({ srcGlob, cwd, isDir }) {
  if (!isDir) {
    return false
  }

  const files = await globby(srcGlob, { cwd })
  const filteredFiles = files.filter((file) => isNotJunk(basename(file)))
  return filteredFiles.length === 0
}

/**
 * Get globbing pattern with files to move/copy
 */
const getSrcGlob = async function (src: string): Promise<null | { srcGlob: string; cwd: string; isDir: boolean }> {
  const srcStat = await getStat(src)

  if (srcStat === undefined) {
    return null
  }

  const isDir = srcStat.isDirectory()
  const srcBasename = basename(src)
  const cwd = dirname(src)

  if (isDir) {
    return { srcGlob: `${srcBasename}/**`, cwd, isDir }
  }

  return { srcGlob: srcBasename, cwd, isDir }
}

const getStat = async (src: string) => {
  try {
    return await fs.stat(src)
  } catch {
    // continue regardless error
  }
}
