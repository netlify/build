import { join, relative } from 'path'
import { readdir } from 'node:fs/promises'
import type { Dirent } from 'node:fs'

import { getCacheDir } from './dir.js'
import { isManifest } from './manifest.js'
import { getBases } from './path.js'

const DEFAULT_DEPTH = 1
// List all cached files/directories, at the top-level
export const list = async function ({
  cacheDir,
  cwd: cwdOpt,
  depth = DEFAULT_DEPTH,
}: {
  cacheDir?: string
  cwd?: string
  depth?: number
} = {}) {
  const bases = await getBases(cwdOpt)
  const cacheDirA = getCacheDir({ cacheDir, cwd: cwdOpt })
  const files = await Promise.all(bases.map(({ name, base }) => listBase({ name, base, cacheDir: cacheDirA, depth })))
  const filesA = files.flat()
  return filesA
}

// TODO: the returned paths are missing the Windows drive
const listBase = async function ({
  name,
  base,
  cacheDir,
  depth,
}: {
  name: string
  base: string
  cacheDir: string
  depth?: number
}) {
  let queue = [{ path: `${cacheDir}/${name}`, depth: 0 }]
  const results: string[] = []
  let queueEntry: { path: string; depth: number } | undefined
  while ((queueEntry = queue.pop())) {
    const { path: currentPath, depth: currentDepth } = queueEntry
    let children: Dirent[]
    try {
      children = await readdir(currentPath, { withFileTypes: true })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        continue
      }
      throw error
    }
    for (const child of children) {
      const childPath = join(child.parentPath, child.name)
      if ((child.isDirectory() || child.isFile()) && fileFilter(child.name)) {
        results.push(join(base, relative(`${cacheDir}/${name}`, childPath)))
      }
      if ((depth === undefined || currentDepth < depth) && child.isDirectory()) {
        queue.push({ path: childPath, depth: currentDepth + 1 })
      }
    }
  }
  return results
}

const fileFilter = function (basename) {
  return !isManifest(basename)
}
