import { promises as fs } from 'fs'
import { join, resolve } from 'path'

import isPathInside from 'is-path-inside'
import pMap from 'p-map'

import { ArchiveFormat, ARCHIVE_FORMAT } from './archive.js'
import { Config } from './config.js'
import { FeatureFlags, getFlags } from './feature_flags.js'
import { FunctionSource } from './function.js'
import { createManifest } from './manifest.js'
import { bundleServer, type ServerOptions, type ServerResult } from './server.js'
import { getFunctionsFromPaths } from './runtimes/index.js'
import { MODULE_FORMAT } from './runtimes/node/utils/module_format.js'
import { type MixedPaths, getFunctionsBag } from './paths.js'
import { addArchiveSize } from './utils/archive_size.js'
import { RuntimeCache } from './utils/cache.js'
import { formatZipResult, FunctionResult } from './utils/format_result.js'
import { listFunctionsDirectories, resolveFunctionsDirectories } from './utils/fs.js'
import { getLogger, LogFunction } from './utils/logger.js'
import { nonNullable } from './utils/non_nullable.js'

export interface ZipFunctionOptions {
  archiveFormat?: ArchiveFormat
  basePath?: string
  branch?: string
  config?: Config
  featureFlags?: FeatureFlags
  repositoryRoot?: string
  zipGo?: boolean
  systemLog?: LogFunction
  debug?: boolean
  internalSrcFolder?: string
}

export interface BundleResult {
  /**
   * The bundled functions. A server is never among them.
   */
  functions: FunctionResult[]

  /**
   * The bundled Netlify Server, when one was given.
   */
  server?: ServerResult
}

export type ZipFunctionsOptions = ZipFunctionOptions & {
  configFileDirectories?: string[]
  manifest?: string
  parallelLimit?: number
}

/**
 * The deploy's functions, and how to bundle them.
 */
export interface FunctionsOptions {
  /**
   * Directories to search, specific function paths, or both.
   */
  paths: MixedPaths

  archiveFormat?: ArchiveFormat
  config?: Config
  configFileDirectories?: string[]
  parallelLimit?: number
}

export type { ServerOptions, ServerResult }

export interface BundleOptions {
  /**
   * Where the archives and the manifest are written.
   */
  destFolder: string

  functions?: FunctionsOptions
  server?: ServerOptions

  /**
   * Path of the manifest file. Defaults to `manifest.json` inside `destFolder`.
   */
  manifest?: string

  basePath?: string
  branch?: string
  debug?: boolean
  featureFlags?: FeatureFlags
  repositoryRoot?: string
  systemLog?: LogFunction
}

const DEFAULT_PARALLEL_LIMIT = 5

const validateArchiveFormat = (archiveFormat: ArchiveFormat) => {
  if (!Object.values(ARCHIVE_FORMAT).includes(archiveFormat)) {
    throw new Error(`Invalid archive format: ${archiveFormat}`)
  }
}

// Zip `srcFolder/*` (Node.js or Go files) to `destFolder/*.zip` so it can be
// used by AWS Lambda
export const zipFunctions = async function (
  input: MixedPaths,
  destFolder: string,
  {
    archiveFormat,
    basePath,
    branch,
    config,
    configFileDirectories,
    debug,
    featureFlags,
    manifest,
    parallelLimit,
    repositoryRoot,
    systemLog,
  }: ZipFunctionsOptions = {},
): Promise<FunctionResult[]> {
  const { functions } = await bundle({
    basePath,
    branch,
    debug,
    destFolder,
    featureFlags,
    functions: {
      archiveFormat,
      config,
      configFileDirectories,
      parallelLimit,
      paths: input,
    },
    manifest,
    repositoryRoot,
    systemLog,
  })

  return functions
}

// Bundles a deploy's functions and its Netlify Server, writing the one manifest
// that describes both.
export const bundle = async function ({
  basePath,
  branch,
  debug,
  destFolder,
  featureFlags: inputFeatureFlags,
  functions: functionsOptions,
  manifest,
  repositoryRoot = basePath,
  server,
  systemLog,
}: BundleOptions): Promise<BundleResult> {
  const {
    archiveFormat = ARCHIVE_FORMAT.ZIP,
    config = {},
    configFileDirectories,
    parallelLimit = DEFAULT_PARALLEL_LIMIT,
    paths,
  } = functionsOptions ?? { paths: [] }

  validateArchiveFormat(archiveFormat)

  const logger = getLogger(systemLog, debug)
  const cache = new RuntimeCache()
  const featureFlags = getFlags(inputFeatureFlags)
  const bag = getFunctionsBag(paths)
  const srcFolders = resolveFunctionsDirectories([...bag.generated.directories, ...bag.user.directories])

  const [foundPaths] = await Promise.all([
    listFunctionsDirectories(srcFolders),
    fs.mkdir(destFolder, { recursive: true }),
  ])
  const functions = await getFunctionsFromPaths([...foundPaths, ...bag.generated.functions, ...bag.user.functions], {
    cache,
    config,
    configFileDirectories,
    dedupe: true,
    featureFlags,
  })
  const results = await pMap(
    functions.values(),
    async (func) => {
      const functionFlags = {
        ...featureFlags,

        // If there's a `nodeModuleFormat` configuration property set to `esm`,
        // extend the feature flags with `zisi_pure_esm_mjs` enabled.
        ...(func.config.nodeModuleFormat === MODULE_FORMAT.ESM ? { zisi_pure_esm_mjs: true } : {}),
      }

      const isInternal =
        bag.generated.functions.includes(func.srcPath) ||
        bag.generated.directories.some((directory) => isPathInside(func.srcPath, directory))

      const zipResult = await func.runtime.zipFunction({
        archiveFormat,
        basePath,
        branch,
        cache,
        config: func.config,
        destFolder,
        extension: func.extension,
        featureFlags: functionFlags,
        filename: func.filename,
        isInternal,
        logger,
        mainFile: func.mainFile,
        name: func.name,
        repositoryRoot,
        runtime: func.runtime,
        srcDir: func.srcDir,
        srcPath: func.srcPath,
        stat: func.stat,
      })

      return { ...zipResult, mainFile: func.mainFile, name: func.name, runtime: func.runtime }
    },
    {
      concurrency: parallelLimit,
    },
  )
  const formattedResults = await Promise.all(
    results.filter(nonNullable).map(async (result) => {
      const resultWithSize = await addArchiveSize(result)

      return formatZipResult(resultWithSize)
    }),
  )

  const serverResult =
    server === undefined
      ? undefined
      : await bundleServer(server, destFolder, {
          archiveFormat,
          basePath,
          cache,
          config,
          featureFlags,
          logger,
          repositoryRoot,
        })

  await createManifest({
    functions: formattedResults,
    path: resolve(manifest || join(destFolder, 'manifest.json')),
    server: serverResult,
  })

  return { functions: formattedResults, server: serverResult }
}

export const zipFunction = async function (
  relativeSrcPath: string,
  destFolder: string,
  {
    archiveFormat = ARCHIVE_FORMAT.ZIP,
    basePath,
    config: inputConfig = {},
    featureFlags: inputFeatureFlags,
    repositoryRoot = basePath,
    systemLog,
    debug,
    internalSrcFolder,
  }: ZipFunctionOptions = {},
): Promise<FunctionResult | undefined> {
  validateArchiveFormat(archiveFormat)

  const logger = getLogger(systemLog, debug)
  const featureFlags = getFlags(inputFeatureFlags)
  const srcPath = resolve(relativeSrcPath)
  const cache = new RuntimeCache()
  const functions = await getFunctionsFromPaths([srcPath], { cache, config: inputConfig, dedupe: true, featureFlags })
  const internalFunctionsPath = internalSrcFolder && resolve(internalSrcFolder)

  if (functions.size === 0) {
    return
  }

  const {
    config,
    extension,
    filename,
    mainFile,
    name,
    runtime,
    srcDir,
    stat: stats,
  }: FunctionSource = functions.values().next().value!

  await fs.mkdir(destFolder, { recursive: true })

  const functionFlags = {
    ...featureFlags,

    // If there's a `nodeModuleFormat` configuration property set to `esm`,
    // extend the feature flags with `zisi_pure_esm_mjs` enabled.
    ...(config.nodeModuleFormat === MODULE_FORMAT.ESM ? { zisi_pure_esm_mjs: true } : {}),
  }
  const zipResult = await runtime.zipFunction({
    archiveFormat,
    basePath,
    cache,
    config,
    destFolder,
    extension,
    featureFlags: functionFlags,
    filename,
    isInternal: Boolean(internalFunctionsPath && isPathInside(srcPath, internalFunctionsPath)),
    logger,
    mainFile,
    name,
    repositoryRoot,
    runtime,
    srcDir,
    srcPath,
    stat: stats,
  })

  return formatZipResult({ ...zipResult, mainFile, name, runtime })
}
