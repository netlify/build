import { join } from 'path'

import readdirp from 'readdirp'

import { getCacheDir } from './dir.js'
import { isManifest } from './manifest.js'
import { getBases } from './path.js'

// List all cached files/directories, at the top-level
export const list = async function ({ cacheDir, cwd: cwdOpt, depth = DEFAULT_DEPTH } = {}) {
  const bases = await getBases(cwdOpt)
  const cacheDirA = getCacheDir({ cacheDir, cwd: cwdOpt })
  const files = await Promise.all(bases.map(({ name, base }) => listBase({ name, base, cacheDir: cacheDirA, depth })))
  const filesA = files.flat()
  return filesA
}

const DEFAULT_DEPTH = 1

// TODO: the returned paths are missing the Windows drive
const listBase = async function ({ name, base, cacheDir, depth }) {
  const files = await readdirp.promise(`${cacheDir}/${name}`, { fileFilter, depth, type: 'files_directories' })
  const filesA = files.map(({ path }) => join(base, path))
  return filesA
}

const fileFilter = function ({ basename }) {
  return !isManifest(basename)
}
