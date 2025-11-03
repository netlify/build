import { promises as fs } from 'fs'
import { join } from 'path'

import commonPathPrefix from 'common-path-prefix'
import { v4 as uuidv4 } from 'uuid'

import { importMapSpecifier } from '../shared/consts.js'

import {
  DenoBridge,
  DenoOptions,
  OnAfterDownloadHook,
  OnBeforeDownloadHook,
  LEGACY_DENO_VERSION_RANGE,
} from './bridge.js'
import type { Bundle } from './bundle.js'
import { FunctionConfig, getFunctionConfig } from './config.js'
import { Declaration, mergeDeclarations } from './declaration.js'
import { load as loadDeployConfig } from './deploy_config.js'
import { EdgeFunction } from './edge_function.js'
import { FeatureFlags, getFlags } from './feature_flags.js'
import { findFunctions } from './finder.js'
import { bundle as bundleESZIP } from './formats/eszip.js'
import { bundle as bundleTarball } from './formats/tarball.js'
import { ImportMap } from './import_map.js'
import { getLogger, LogFunction, Logger } from './logger.js'
import { writeManifest } from './manifest.js'
import { vendorNPMSpecifiers } from './npm_dependencies.js'
import { ensureLatestTypes } from './types.js'
import { nonNullable } from './utils/non_nullable.js'
import { getPathInHome } from './home_path.js'

export interface BundleOptions {
  basePath?: string
  bootstrapURL?: string
  cacheDirectory?: string
  configPath?: string
  debug?: boolean
  distImportMapPath?: string
  featureFlags?: FeatureFlags
  importMapPaths?: (string | undefined)[]
  internalSrcFolder?: string | string[]
  onAfterDownload?: OnAfterDownloadHook
  onBeforeDownload?: OnBeforeDownloadHook
  rootPath?: string
  systemLogger?: LogFunction
  userLogger?: LogFunction
  vendorDirectory?: string
}

export const bundle = async (
  sourceDirectories: string[],
  distDirectory: string,
  tomlDeclarations: Declaration[] = [],
  {
    basePath: inputBasePath,
    cacheDirectory,
    configPath,
    debug,
    distImportMapPath,
    featureFlags: inputFeatureFlags,
    importMapPaths = [],
    internalSrcFolder,
    onAfterDownload,
    onBeforeDownload,
    rootPath,
    userLogger,
    systemLogger,
    vendorDirectory,
  }: BundleOptions = {},
) => {
  const logger = getLogger(systemLogger, userLogger, debug)
  const featureFlags = getFlags(inputFeatureFlags)
  const options: DenoOptions = {
    debug,
    cacheDirectory,
    featureFlags,
    logger,
    onAfterDownload,
    onBeforeDownload,
  }

  if (cacheDirectory !== undefined) {
    options.denoDir = join(cacheDirectory, 'deno_dir')
  }

  const deno = new DenoBridge(options)
  const basePath = getBasePath(sourceDirectories, inputBasePath)

  await ensureLatestTypes(deno, logger)

  // The name of the bundle will be the hash of its contents, which we can't
  // compute until we run the bundle process. For now, we'll use a random ID
  // to create the bundle artifacts and rename them later.
  const buildID = uuidv4()

  // Loading any configuration options from the deploy configuration API, if it
  // exists.
  const deployConfig = await loadDeployConfig(configPath, logger)

  // Layers are marked as externals in the ESZIP, so that those specifiers are
  // not actually included in the bundle.
  const externals = deployConfig.layers.map((layer) => layer.name)

  const internalSrcFolders = (Array.isArray(internalSrcFolder) ? internalSrcFolder : [internalSrcFolder]).filter(
    nonNullable,
  )
  const userSourceDirectories = sourceDirectories.filter((dir) => !internalSrcFolders.includes(dir))

  const importMap = new ImportMap()
  await importMap.addFiles([deployConfig?.importMap, ...importMapPaths], logger)

  const userFunctions = userSourceDirectories.length === 0 ? [] : await findFunctions(userSourceDirectories)
  const internalFunctions = internalSrcFolder ? await findFunctions(internalSrcFolders) : []
  const functions = [...internalFunctions, ...userFunctions]
  const vendor = await safelyVendorNPMSpecifiers({
    basePath,
    featureFlags,
    functions,
    importMap,
    logger,
    rootPath: rootPath ?? basePath,
    vendorDirectory,
  })

  const bundles: Bundle[] = []

  if (featureFlags.edge_bundler_generate_tarball || featureFlags.edge_bundler_dry_run_generate_tarball) {
    const tarballPromise = bundleTarball({
      basePath,
      buildID,
      debug,
      deno,
      distDirectory,
      functions,
      featureFlags,
      importMap: importMap.clone(),
      vendorDirectory: vendor?.directory,
    })

    if (featureFlags.edge_bundler_dry_run_generate_tarball) {
      try {
        await tarballPromise
        logger.system('Dry run: Tarball bundle generated successfully.')
      } catch (error: unknown) {
        if (error instanceof Error) {
          logger.system(`Dry run: Tarball bundle generation failed: ${error.message}`)
        } else {
          logger.system(`Dry run: Tarball bundle generation failed: ${String(error)}`)
        }
      }
    }

    if (featureFlags.edge_bundler_generate_tarball) {
      bundles.push(await tarballPromise)
    }
  }

  if (vendor) {
    importMap.add(vendor.importMap)
  }

  bundles.push(
    await bundleESZIP({
      basePath,
      buildID,
      debug,
      deno,
      distDirectory,
      externals,
      functions,
      featureFlags,
      importMap,
      vendorDirectory: vendor?.directory,
    }),
  )

  // The final file name of the bundles contains a SHA256 hash of the contents,
  // which we can only compute now that the files have been generated. So let's
  // rename the bundles to their permanent names.
  await createFinalBundles(bundles, distDirectory, buildID)

  const { internalFunctions: internalFunctionsWithConfig, userFunctions: userFunctionsWithConfig } =
    await getFunctionConfigs({
      deno,
      importMap,
      internalFunctions,
      log: logger,
      userFunctions,
    })

  // Creating a final declarations array by combining the TOML file with the
  // deploy configuration API and the in-source configuration.
  const declarations = mergeDeclarations(
    tomlDeclarations,
    userFunctionsWithConfig,
    internalFunctionsWithConfig,
    deployConfig.declarations,
    featureFlags,
  )

  const internalFunctionConfig = createFunctionConfig({
    internalFunctionsWithConfig,
    declarations,
  })

  const manifest = await writeManifest({
    bundles,
    declarations,
    distDirectory,
    featureFlags,
    functions,
    userFunctionConfig: userFunctionsWithConfig,
    internalFunctionConfig,
    importMap: importMapSpecifier,
    layers: deployConfig.layers,
  })

  await vendor?.cleanup()

  if (distImportMapPath) {
    await importMap.writeToFile(distImportMapPath)
  }

  return { functions, manifest }
}

interface GetFunctionConfigsOptions {
  deno: DenoBridge
  importMap: ImportMap
  internalFunctions: EdgeFunction[]
  log: Logger
  userFunctions: EdgeFunction[]
}

const getFunctionConfigs = async ({
  deno,
  importMap,
  log,
  internalFunctions,
  userFunctions,
}: GetFunctionConfigsOptions) => {
  const functions = [...internalFunctions, ...userFunctions]
  const results = await Promise.allSettled(
    functions.map(async (func) => {
      return [func.name, await getFunctionConfig({ functionPath: func.path, importMap, deno, log })] as const
    }),
  )
  const legacyDeno = new DenoBridge({
    cacheDirectory: getPathInHome('deno-cli-v1'),
    useGlobal: false,
    versionRange: LEGACY_DENO_VERSION_RANGE,
  })

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const func = functions[i]

    // We offer support for some features of Deno 1.x that have been removed
    // from 2.x, such as import assertions and the `window` global. When we
    // see that we failed to extract a config due to those edge cases, re-run
    // the script with Deno 1.x so we can extract the config.
    if (
      result.status === 'rejected' &&
      result.reason instanceof Error &&
      (result.reason.cause === 'IMPORT_ASSERT' || result.reason.cause === 'WINDOW_GLOBAL')
    ) {
      try {
        const fallbackConfig = await getFunctionConfig({ functionPath: func.path, importMap, deno: legacyDeno, log })

        results[i] = { status: 'fulfilled', value: [func.name, fallbackConfig] }
      } catch {
        throw result.reason
      }
    }
  }

  const failure = results.find((result) => result.status === 'rejected')
  if (failure) {
    throw failure.reason
  }

  const configs = results.map((config) => (config as PromiseFulfilledResult<[string, FunctionConfig]>).value)

  return {
    internalFunctions: Object.fromEntries(configs.slice(0, internalFunctions.length)),
    userFunctions: Object.fromEntries(configs.slice(internalFunctions.length)),
  }
}

const createFinalBundles = async (bundles: Bundle[], distDirectory: string, buildID: string) => {
  const renamingOps = bundles.map(async ({ extension, hash }) => {
    const tempBundlePath = join(distDirectory, `${buildID}${extension}`)
    const finalBundlePath = join(distDirectory, `${hash}${extension}`)

    await fs.rename(tempBundlePath, finalBundlePath)

    return finalBundlePath
  })

  return await Promise.all(renamingOps)
}

const getBasePath = (sourceDirectories: string[], inputBasePath?: string) => {
  // If there's a specific base path supplied, that takes precedence.
  if (inputBasePath !== undefined) {
    return inputBasePath
  }

  // `common-path-prefix` returns an empty string when called with a single
  // path, so we check for that case and return the path itself instead.
  if (sourceDirectories.length === 1) {
    return sourceDirectories[0]
  }

  return commonPathPrefix(sourceDirectories)
}

interface MergeWithDeclarationConfigOptions {
  functionName: string
  config: FunctionConfig
  declarations: Declaration[]
}

// We used to allow the `name` and `generator` fields to be defined at the
// declaration level. We want these properties to live at the function level
// in their config object, so we translate that for backwards-compatibility.
const mergeWithDeclarationConfig = ({ functionName, config, declarations }: MergeWithDeclarationConfigOptions) => {
  const declaration = declarations?.find((decl) => decl.function === functionName)

  return {
    ...config,
    name: declaration?.name || config.name,
    generator: declaration?.generator || config.generator,
  }
}

const addGeneratorFallback = (config: FunctionConfig) => ({
  ...config,
  generator: config.generator || 'internalFunc',
})

interface CreateFunctionConfigOptions {
  internalFunctionsWithConfig: Record<string, FunctionConfig>
  declarations: Declaration[]
}

const createFunctionConfig = ({ internalFunctionsWithConfig, declarations }: CreateFunctionConfigOptions) =>
  Object.entries(internalFunctionsWithConfig).reduce(
    (acc, [functionName, config]) => {
      const mergedConfigFields = mergeWithDeclarationConfig({ functionName, config, declarations })

      return {
        ...acc,
        [functionName]: addGeneratorFallback(mergedConfigFields),
      }
    },
    {} as Record<string, FunctionConfig>,
  )

interface VendorNPMOptions {
  basePath: string
  featureFlags: FeatureFlags
  functions: EdgeFunction[]
  importMap: ImportMap
  logger: Logger
  rootPath: string
  vendorDirectory: string | undefined
}

const safelyVendorNPMSpecifiers = async ({
  basePath,
  functions,
  importMap,
  logger,
  rootPath,
  vendorDirectory,
}: VendorNPMOptions) => {
  try {
    return await vendorNPMSpecifiers({
      basePath,
      directory: vendorDirectory,
      functions: functions.map(({ path }) => path),
      importMap,
      logger,
      environment: 'production',
      rootPath,
    })
  } catch (error) {
    logger.system(error)
  }
}
