import { existsSync } from 'fs'
import { join, resolve } from 'path'

import { findUp } from 'find-up'

const FILENAME = 'netlify.toml'

/**
 * Configuration location can be:
 * - a local path with the --config CLI flag
 * - a `netlify.*` file in the `repositoryRoot/{base}/{packagePath}`
 * - a `netlify.*` file in the `repositoryRoot/{base}`
 * - a `netlify.*` file in the `repositoryRoot`
 * - a `netlify.*` file in the current directory or any parent
 */
export const getConfigPath = async function ({
  configOpt,
  cwd,
  repositoryRoot,
  configBase,
  packagePath,
}: {
  cwd: string
  repositoryRoot: string
  configBase
  configOpt?: string
  packagePath?: string
}) {
  // Returns the first path that exists, preserving the priority order above.
  const candidates = [
    searchConfigOpt(cwd, configOpt),
    searchBaseConfigFile(repositoryRoot, configBase, packagePath),
    searchConfigFile(repositoryRoot),
    findUp(FILENAME, { cwd }),
  ]
  for (const candidate of candidates) {
    const configPath = await candidate
    if (configPath) {
      return configPath
    }
  }
  return undefined
}

/** --config CLI flag */
const searchConfigOpt = function (cwd: string, configOpt?: string) {
  if (configOpt === undefined || configOpt.length === 0) {
    return
  }

  return resolve(cwd, configOpt)
}

/**
 * Look for `repositoryRoot/{base}/{packagePath || '}/netlify.*`
 */
const searchBaseConfigFile = function (repoRoot: string, base?: string, packagePath?: string) {
  if (base === undefined && packagePath === undefined) {
    return
  }

  const cwd = join(base ? base : repoRoot, packagePath || '')
  return searchConfigFile(cwd)
}
/**
 * Look for several file extensions for `netlify.*`
 */
const searchConfigFile = function (cwd: string): string | undefined {
  const path = resolve(cwd, FILENAME)
  if (!existsSync(path)) {
    return
  }
  return path
}
