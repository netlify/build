import { extname } from 'path'

import { Config } from './config.js'
import { FeatureFlags, getFlags } from './feature_flags.js'
import { FunctionSource } from './function.js'
import { type MixedPaths, getFunctionsBag } from './paths.js'
import { getFunctionFromPath, getFunctionsFromPaths } from './runtimes/index.js'
import { parseFile, StaticAnalysisResult } from './runtimes/node/in_source_config/index.js'
import { ModuleFormat } from './runtimes/node/utils/module_format.js'
import { GetSrcFilesFunction, RuntimeName, RUNTIME } from './runtimes/runtime.js'
import { RuntimeCache } from './utils/cache.js'
import { listFunctionsDirectories, resolveFunctionsDirectories } from './utils/fs.js'
import type { ExtendedRoute, Route } from './utils/routes.js'

export { Config, FunctionConfig } from './config.js'
export { zipFunction, zipFunctions, ZipFunctionOptions, ZipFunctionsOptions } from './zip.js'
export type { FunctionsBag } from './paths.js'

export { ArchiveFormat, ARCHIVE_FORMAT } from './archive.js'
export type { TrafficRules } from './rate_limit.js'
export type { ExtendedRoute, Route } from './utils/routes.js'
export { NodeBundlerName, NODE_BUNDLER } from './runtimes/node/bundlers/types.js'
export { RuntimeName, RUNTIME } from './runtimes/runtime.js'
export { ModuleFormat, MODULE_FORMAT } from './runtimes/node/utils/module_format.js'
export { Manifest } from './manifest.js'
export { FunctionResult } from './utils/format_result.js'

export interface ListedFunction {
  name: string
  mainFile: string
  runtime: RuntimeName
  extension: string
  runtimeAPIVersion?: number
  schedule?: string
  displayName?: string
  generator?: string
  timeout?: number
  inputModuleFormat?: ModuleFormat
  excludedRoutes?: Route[]
  routes?: ExtendedRoute[]
  srcDir?: string
  srcPath: string
}

type ListedFunctionFile = ListedFunction & {
  srcFile: string
}

interface AugmentedFunctionSource extends FunctionSource {
  staticAnalysisResult?: StaticAnalysisResult
}

const augmentWithStaticAnalysis = async (func: FunctionSource): Promise<AugmentedFunctionSource> => {
  if (func.runtime.name !== RUNTIME.JAVASCRIPT) {
    return func
  }

  const staticAnalysisResult = await parseFile(func.mainFile, {
    functionName: func.name,
  })

  return { ...func, staticAnalysisResult }
}

interface ListFunctionsOptions {
  basePath?: string
  config?: Config
  configFileDirectories?: string[]
  featureFlags?: FeatureFlags
  parseISC?: boolean
}

// List all Netlify Functions main entry files for a specific directory.
export const listFunctions = async function (
  input: MixedPaths,
  { featureFlags: inputFeatureFlags, config, configFileDirectories, parseISC = false }: ListFunctionsOptions = {},
) {
  const featureFlags = getFlags(inputFeatureFlags)
  const bag = getFunctionsBag(input)
  const srcFolders = resolveFunctionsDirectories([...bag.generated.directories, ...bag.user.directories])
  const paths = await listFunctionsDirectories(srcFolders)
  const cache = new RuntimeCache()
  const functionsMap = await getFunctionsFromPaths([...paths, ...bag.generated.functions, ...bag.user.functions], {
    cache,
    config,
    configFileDirectories,
    featureFlags,
  })
  const functions = [...functionsMap.values()]
  const augmentedFunctions = parseISC
    ? await Promise.all(functions.map((func) => augmentWithStaticAnalysis(func)))
    : functions

  return augmentedFunctions.map(getListedFunction)
}

interface ListFunctionOptions {
  basePath?: string
  config?: Config
  configFileDirectories?: string[]
  featureFlags?: FeatureFlags
  parseISC?: boolean
}

// Finds a function at a specific path.
export const listFunction = async function (
  path: string,
  { featureFlags: inputFeatureFlags, config, configFileDirectories, parseISC = false }: ListFunctionOptions = {},
) {
  const featureFlags = getFlags(inputFeatureFlags)
  const cache = new RuntimeCache()
  const func = await getFunctionFromPath(path, { cache, config, configFileDirectories, featureFlags })

  if (!func) {
    return
  }

  const augmentedFunction = parseISC ? await augmentWithStaticAnalysis(func) : func

  return getListedFunction(augmentedFunction)
}

// List all Netlify Functions files for a specific directory
export const listFunctionsFiles = async function (
  relativeSrcFolders: string | string[],
  {
    basePath,
    config,
    configFileDirectories,
    featureFlags: inputFeatureFlags,
    parseISC = false,
  }: ListFunctionsOptions = {},
): Promise<ListedFunctionFile[]> {
  const featureFlags = getFlags(inputFeatureFlags)
  const srcFolders = resolveFunctionsDirectories(relativeSrcFolders)
  const paths = await listFunctionsDirectories(srcFolders)
  const cache = new RuntimeCache()
  const functionsMap = await getFunctionsFromPaths(paths, { cache, config, configFileDirectories, featureFlags })
  const functions = [...functionsMap.values()]
  const augmentedFunctions = parseISC
    ? await Promise.all(functions.map((func) => augmentWithStaticAnalysis(func)))
    : functions
  const listedFunctionsFiles = await Promise.all(
    augmentedFunctions.map((func) => getListedFunctionFiles(func, { basePath, featureFlags })),
  )

  return listedFunctionsFiles.flat()
}

const getListedFunction = function ({
  config,
  extension,
  staticAnalysisResult,
  mainFile,
  name,
  runtime,
  srcDir,
  srcPath,
}: AugmentedFunctionSource): ListedFunction {
  return {
    displayName: config.name,
    extension,
    excludedRoutes: staticAnalysisResult?.excludedRoutes,
    generator: config.generator,
    timeout: config.timeout,
    mainFile,
    name,
    routes: staticAnalysisResult?.routes,
    runtime: runtime.name,
    runtimeAPIVersion: staticAnalysisResult ? (staticAnalysisResult?.runtimeAPIVersion ?? 1) : undefined,
    schedule: staticAnalysisResult?.config?.schedule ?? config.schedule,
    inputModuleFormat: staticAnalysisResult?.inputModuleFormat,
    srcDir,
    srcPath,
  }
}

const getListedFunctionFiles = async function (
  func: AugmentedFunctionSource,
  options: { basePath?: string; featureFlags: FeatureFlags },
): Promise<ListedFunctionFile[]> {
  const srcFiles = await getSrcFiles({
    ...func,
    ...options,
    runtimeAPIVersion: func.staticAnalysisResult?.runtimeAPIVersion ?? 1,
  })

  return srcFiles.map((srcFile) => ({ ...getListedFunction(func), srcFile, extension: extname(srcFile) }))
}

const getSrcFiles: GetSrcFilesFunction = async function ({ extension, runtime, srcPath, ...args }) {
  const { getSrcFiles: getRuntimeSrcFiles } = runtime

  if (extension === '.zip' || typeof getRuntimeSrcFiles !== 'function') {
    return [srcPath]
  }

  return await getRuntimeSrcFiles({
    extension,
    runtime,
    srcPath,
    ...args,
  })
}
