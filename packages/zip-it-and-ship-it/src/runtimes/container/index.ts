import { basename, dirname, extname } from 'path'

import { copyFile } from 'copy-file'

import { SourceFile } from '../../function.js'
import type { RuntimeCache } from '../../utils/cache.js'
import { cachedLstat } from '../../utils/fs.js'
import getInternalValue from '../../utils/get_internal_value.js'
import { nonNullable } from '../../utils/non_nullable.js'
import { FindFunctionInPathFunction, FindFunctionsInPathsFunction, Runtime, RUNTIME, ZipFunction } from '../runtime.js'

import { isImageArchive } from './archive.js'

// The extension a container image archive is expected to carry. Restricting by
// extension first keeps us from reading every file in the functions directory.
const ARCHIVE_EXTENSION = '.tar'

const findFunctionsInPaths: FindFunctionsInPathsFunction = async function ({ cache, featureFlags, paths }) {
  const functions = await Promise.all(paths.map((path) => findFunctionInPath({ cache, featureFlags, path })))

  return functions.filter(nonNullable)
}

const findFunctionInPath: FindFunctionInPathFunction = async function ({ cache, featureFlags, path }) {
  if (!featureFlags.zisi_container_functions) {
    return
  }

  if (extname(path) !== ARCHIVE_EXTENSION) {
    return
  }

  const stat = await cachedLstat(cache.lstatCache, path)

  if (stat.isDirectory()) {
    return
  }

  if (!(await isImageArchive(path))) {
    return
  }

  return processArchive({ cache, path })
}

const processArchive = async ({ cache, path }: { cache: RuntimeCache; path: string }): Promise<SourceFile> => {
  const stat = await cachedLstat(cache.lstatCache, path)

  return {
    extension: ARCHIVE_EXTENSION,
    filename: basename(path),
    mainFile: path,
    name: basename(path, ARCHIVE_EXTENSION),
    srcDir: dirname(path),
    srcPath: path,
    stat,
  }
}

const zipFunction: ZipFunction = async function ({ config, destFolder, filename, srcPath, isInternal }) {
  const destPath = `${destFolder}/${filename}`

  await copyFile(srcPath, destPath)

  return {
    config,
    displayName: config.name,
    generator: config.generator ?? getInternalValue(isInternal),
    path: destPath,

    // A container starts from the entrypoint recorded in its own image config.
    // There is no entry file for the platform to call into.
    entryFilename: '',
  }
}

const runtime: Runtime = { findFunctionsInPaths, findFunctionInPath, name: RUNTIME.CONTAINER, zipFunction }

export default runtime
