import { promises as fs } from 'fs'
import { basename, dirname } from 'path'

import cpy from 'cpy'
import globby from 'globby'
import junk from 'junk'
import moveFile from 'move-file'

// Move or copy a cached file/directory from/to a local one
export const moveCacheFile = async function (src, dest, move) {
  // Moving is faster but removes the source files locally
  if (move) {
    return moveFile(src, dest, { overwrite: false })
  }

  const { srcGlob, cwd } = await getSrcGlob(src)
  return cpy(srcGlob, dirname(dest), { cwd, parents: true, overwrite: false })
}

// Non-existing files and empty directories are always skipped
export const hasFiles = async function (src) {
  const { srcGlob, cwd, isDir } = await getSrcGlob(src)
  return srcGlob !== undefined && !(await isEmptyDir({ srcGlob, cwd, isDir }))
}

// Replicates what `cpy` is doing under the hood.
const isEmptyDir = async function ({ srcGlob, cwd, isDir }) {
  if (!isDir) {
    return false
  }

  const files = await globby(srcGlob, { cwd })
  const filteredFiles = files.filter((file) => junk.not(basename(file)))
  return filteredFiles.length === 0
}

// Get globbing pattern with files to move/copy
const getSrcGlob = async function (src) {
  const srcStat = await getStat(src)

  if (srcStat === undefined) {
    return {}
  }

  const isDir = srcStat.isDirectory()
  const srcBasename = basename(src)
  const cwd = dirname(src)

  if (isDir) {
    return { srcGlob: `${srcBasename}/**`, cwd, isDir }
  }

  return { srcGlob: srcBasename, cwd, isDir }
}

const getStat = async function (src) {
  try {
    return await fs.stat(src)
  } catch {}
}
