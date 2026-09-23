import { existsSync } from 'fs'
import { join, resolve } from 'path'

import { findUp } from 'find-up'
import pLocate from 'p-locate'

import { nonEmpty } from './utils/non_empty.js'

const FILENAME = 'netlify.toml'

type ConfigPathOptions = {
  configOpt?: string | undefined
  cwd: string
  repositoryRoot: string
  /** The base directory to look in, if any. */
  configBase?: string | undefined
  packagePath?: string | undefined
}

/**
 * Find the configuration file, in order:
 *  - the `config` option, relative to `cwd`
 *  - `netlify.toml` in `{base}/{packagePath}`, in `{repositoryRoot}/{packagePath}` without a base,
 *    or in `{base}` without a package path
 *  - `netlify.toml` in the repository root
 *  - `netlify.toml` in `cwd` or any of its parents
 */
export const getConfigPath = async function ({
  configOpt,
  cwd,
  repositoryRoot,
  configBase,
  packagePath,
}: ConfigPathOptions): Promise<string | undefined> {
  return await pLocate<string | undefined>(
    [
      searchConfigOpt(cwd, configOpt),
      searchBaseConfigFile(repositoryRoot, configBase, packagePath),
      searchConfigFile(repositoryRoot),
      findUp(FILENAME, { cwd }),
    ],
    Boolean,
  )
}

const searchConfigOpt = function (cwd: string, configOpt?: string) {
  if (configOpt === undefined || configOpt.length === 0) {
    return
  }

  return resolve(cwd, configOpt)
}

const searchBaseConfigFile = function (repositoryRoot: string, base?: string, packagePath?: string) {
  if (base === undefined && packagePath === undefined) {
    return
  }

  return searchConfigFile(join(nonEmpty(base) ?? repositoryRoot, packagePath ?? ''))
}

const searchConfigFile = function (directory: string) {
  const path = resolve(directory, FILENAME)
  return existsSync(path) ? path : undefined
}
