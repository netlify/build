import { existsSync, promises as fs } from 'fs'
import { dirname, relative, sep } from 'path'

import type { ResolveConfigOptions } from '../types/options.js'

/** Files marking a directory as a base directory. */
const BASE_FILENAMES = ['.netlify', 'netlify.toml', 'package.json']

/**
 * The base directory implied by `cwd`: the closest directory between `cwd` and the repository root,
 * excluding the latter, that has a `.netlify` directory, a `netlify.toml` or a `package.json`. This
 * lets netlify-cli users `cd` into a monorepo package to build it.
 */
export const getBaseOverride = async function ({
  repositoryRoot,
  cwd,
}: {
  repositoryRoot: string
  cwd: string
}): Promise<Pick<ResolveConfigOptions, 'base' | 'baseRelDir'>> {
  if (repositoryRoot === cwd) {
    return {}
  }

  const [realRepositoryRoot, realCwd] = await Promise.all([fs.realpath(repositoryRoot), fs.realpath(cwd)])
  const basePath = getSubdirs(realRepositoryRoot, realCwd)
    .flatMap((subdir) => BASE_FILENAMES.map((filename) => `${subdir}/${filename}`))
    .find((path) => existsSync(path))

  if (basePath === undefined) {
    return {}
  }

  // A `base` starting with `/` is relative to the repository root, so this can't be absolute. With
  // an explicit base, paths are resolved relative to it.
  return { base: relative(repositoryRoot, dirname(basePath)), baseRelDir: true }
}

/** The directories from `dir` up to, but excluding, `repositoryRoot`, closest first. */
const getSubdirs = function (repositoryRoot: string, dir: string): string[] {
  const subdirs: string[] = []
  for (let current = dir; current.startsWith(`${repositoryRoot}${sep}`); current = dirname(current)) {
    subdirs.push(current)
  }
  return subdirs
}
