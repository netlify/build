import { isDirectory } from 'path-type'

import { throwUserError } from './error.js'

/**
 * The build directory, used to resolve most paths: the base directory if there is one, the
 * repository root otherwise. Build commands and plugins run in it, so it must exist. The
 * repository root has already been checked.
 */
export const getBuildDir = async function (repositoryRoot: string, base?: string): Promise<string> {
  const buildDir = base ?? repositoryRoot
  if (buildDir !== repositoryRoot && !(await isDirectory(buildDir))) {
    throwUserError(`Base directory does not exist: ${buildDir}`)
  }

  return buildDir
}
