import { promises as fs, Stats } from 'fs'
import { basename, dirname, join } from 'path'

import cpy from 'cpy'
import { type Options, globby } from 'globby'
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

  const { srcGlob, dest: matchedDest, ...options } = await getSrcAndDest(src, dirname(dest))
  if (srcGlob && matchedDest) {
    return cpy(srcGlob, matchedDest, { ...options, overwrite: false })
  }
}

/**
 * Non-existing files and empty directories are always skipped
 */
export const hasFiles = async function (src: string): Promise<boolean> {
  const { srcGlob, isDir, dest, ...options } = await getSrcAndDest(src, '')
  return srcGlob !== undefined && !(await isEmptyDir(srcGlob, isDir, options))
}

/** Replicates what `cpy` is doing under the hood. */
const isEmptyDir = async function (globPattern: string, isDir: boolean, options: Options) {
  if (!isDir) {
    return false
  }

  const files = await globby(globPattern, options)
  const filteredFiles = files.filter((file) => isNotJunk(basename(file)))
  return filteredFiles.length === 0
}

type GlobOptions = {
  srcGlob?: string
  dest?: string
  isDir: boolean
  cwd: string
  dot?: boolean
}

/**
 * Get globbing pattern with files to move/copy
 */
const getSrcAndDest = async function (src: string, dest: string): Promise<GlobOptions> {
  const srcStat = await getStat(src)

  if (srcStat === undefined) {
    return { srcGlob: undefined, isDir: false, cwd: '' }
  }

  const isDir = srcStat.isDirectory()
  const srcBasename = basename(src)
  const cwd = dirname(src)

  const baseOptions: GlobOptions = {
    srcGlob: srcBasename,
    dest,
    isDir,
    cwd,
    dot: true, // collect .dot directories as well
  }

  if (isDir) {
    return { ...baseOptions, srcGlob: `${srcBasename}/**`, dest: join(dest, srcBasename) }
  }

  return baseOptions
}

const getStat = async (src: string): Promise<Stats | undefined> => {
  try {
    return await fs.stat(src)
  } catch {
    // continue regardless error
    return undefined
  }
}
