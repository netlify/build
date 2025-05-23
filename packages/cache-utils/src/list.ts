import { join } from 'path'

import { readdirpPromise } from 'readdirp'

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
  const files = await readdirpPromise(`${cacheDir}/${name}`, { fileFilter, depth, type: 'files_directories' })
  const filesA = files.map(({ path }) => join(base, path))
  return filesA
}

const fileFilter = function ({ basename }) {
  return !isManifest(basename)
}
