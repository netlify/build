import { existsSync } from 'fs'
import { resolve } from 'path'

import { findUp } from 'find-up'
import pLocate from 'p-locate'

/**
 * Configuration location can be:
 * - a local path with the --config CLI flag
 * - a `netlify.*` file in the `repositoryRoot/{base}`
 * - a `netlify.*` file in the `repositoryRoot`
 * - a `netlify.*` file in the current directory or any parent
 */
export const getConfigPath = async function ({ configOpt, cwd, repositoryRoot, configBase }) {
  const configPath = await pLocate(
    [
      searchConfigOpt(cwd, configOpt),
      searchBaseConfigFile(configBase),
      searchConfigFile(repositoryRoot),
      findUp(FILENAME, { cwd }),
    ],
    Boolean,
  )
  return configPath
}

/** --config CLI flag */
const searchConfigOpt = function (cwd: string, configOpt?: string) {
  if (configOpt === undefined || configOpt.length === 0) {
    return
  }

  return resolve(cwd, configOpt)
}

/**
 * Look for `repositoryRoot/{base}/netlify.*`
 */
const searchBaseConfigFile = function (configBase?: string) {
  if (configBase === undefined) {
    return
  }

  return searchConfigFile(configBase)
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

const FILENAME = 'netlify.toml'
