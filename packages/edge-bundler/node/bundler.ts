import crypto from 'crypto'
import { promises as fs } from 'fs'
import { join } from 'path'

import commonPathPrefix from 'common-path-prefix'

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
import { generateManifestFunctionConfig, generateManifestRoutes, writeManifest } from './manifest.js'
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
  const buildID = crypto.randomUUID()

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

  if (vendor) {
    importMap.add(vendor.importMap)
  }

  // Extracts the in-source configuration for each function and derives the
  // manifest's function config and routes from it.
  const computeManifestData = async (log: Logger) => {
    const { internalFunctions: internalFunctionsWithConfig, userFunctions: userFunctionsWithConfig } =
      await getFunctionConfigs({
        deno,
        importMap,
        internalFunctions,
        log,
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

    const manifestFunctionConfig = generateManifestFunctionConfig({
      functions,
      internalFunctionConfig,
      userFunctionConfig: userFunctionsWithConfig,
    })

    const manifestRoutes = generateManifestRoutes({
      functions,
      declarations,
    })

    return { manifestFunctionConfig, manifestRoutes }
  }

  const excludeUnroutedFunctions = Boolean(featureFlags.edge_bundler_exclude_unrouted_functions)

  // Excluding unrouted functions is the only reason to extract the config
  // before bundling - we need the routes to know what to leave out. When we're
  // not, we keep extracting it after bundling, as we always have, so that the
  // extra Deno subprocess never runs ahead of the bundle and can't change what
  // a build failure looks like.
  //
  // Config extraction reports the underlying failure to the user before it
  // throws. When it runs up front we may end up discarding that error in favour
  // of a bundling error (see below), and printing the detail of an error we
  // then discard is just noise - so on that path we hold those logs back and
  // only flush them if we do surface the config error.
  const heldUserLogs: unknown[][] = []
  const configLogger: Logger = {
    system: logger.system,
    user: (...args: unknown[]) => {
      heldUserLogs.push(args)
    },
  }
  const manifestDataPromise = excludeUnroutedFunctions ? computeManifestData(configLogger) : undefined

  // A function with no route is never invoked, so bundling it only serves to
  // eagerly load code that can never run - which can surface import-time
  // failures. The manifest is still generated from the full set of functions,
  // but its routes exclude unrouted functions by definition. If config
  // extraction failed, we have no routes to go on, so we bundle everything and
  // let bundling report the failure.
  const routes = manifestDataPromise ? (await manifestDataPromise.catch(() => undefined))?.manifestRoutes : undefined
  const bundledFunctions =
    excludeUnroutedFunctions && routes
      ? functions.filter(({ name }) => !routes.unroutedFunctions.includes(name))
      : functions

  // With nothing to bundle there is no code that can ever be invoked, so we
  // produce neither a bundle nor a manifest. The deploy pipeline treats a
  // manifest that exists but carries no ESZIP bundle as the deprecated JS format
  // and can reject the deploy, so a missing manifest - the same path as a site
  // with no edge functions at all - is safer than an empty one.
  if (bundledFunctions.length === 0) {
    // Config extraction may have produced function output that we were holding
    // back; surface it before returning.
    heldUserLogs.forEach((args) => {
      logger.user(...args)
    })
    logger.system('Skipping bundling because no edge function has a route.')

    await vendor?.cleanup()

    return { functions, manifest: undefined }
  }

  const bundles: Bundle[] = []
  let tarballBundleDurationMs: number | undefined
  let tarballDryRunError: unknown
  let finalizeTarballBundle: Awaited<ReturnType<typeof bundleTarball>> | undefined

  if (featureFlags.edge_bundler_generate_tarball || featureFlags.edge_bundler_dry_run_generate_tarball) {
    const tarballInitialPromise = (async () => {
      const start = Date.now()

      try {
        return await bundleTarball({
          basePath,
          buildID,
          debug,
          deno,
          distDirectory,
          functions: bundledFunctions,
          featureFlags,
          importMap: importMap.clone(),
          vendorDirectory: vendor?.directory,
        })
      } finally {
        tarballBundleDurationMs = Date.now() - start
      }
    })()

    let tarballPromiseResolved = false

    if (featureFlags.edge_bundler_dry_run_generate_tarball) {
      try {
        await tarballInitialPromise
        tarballPromiseResolved = true
      } catch (error: unknown) {
        tarballDryRunError = error ?? new Error('Unknown error during tarball bundle generation')
      }
    }

    if (featureFlags.edge_bundler_generate_tarball || tarballPromiseResolved) {
      finalizeTarballBundle = await tarballInitialPromise
    }
  }

  bundles.push(
    await bundleESZIP({
      basePath,
      buildID,
      debug,
      deno,
      distDirectory,
      externals,
      functions: bundledFunctions,
      featureFlags,
      importMap,
      vendorDirectory: vendor?.directory,
    }),
  )

  // When we extracted the config up front, bundling didn't fail, so no more
  // precise error is coming - re-awaiting surfaces the config extraction error
  // if there was one. When we didn't, we extract it now, after bundling, as we
  // always have. Either way, we reach this point only once bundling has had its
  // chance to throw, so any logs we held back are no longer masking a bundling
  // error and should reach the user: on success they are the function's own
  // output, on failure the detail of the error we are about to surface.
  let manifestData: Awaited<ReturnType<typeof computeManifestData>>

  try {
    manifestData = await (manifestDataPromise ?? computeManifestData(logger))
  } finally {
    heldUserLogs.forEach((args) => {
      logger.user(...args)
    })
  }

  const { manifestFunctionConfig, manifestRoutes } = manifestData

  if (!tarballDryRunError && finalizeTarballBundle) {
    try {
      bundles.unshift(await finalizeTarballBundle({ manifestFunctionConfig, manifestRoutes }))
    } catch (error: unknown) {
      if (featureFlags.edge_bundler_dry_run_generate_tarball) {
        tarballDryRunError = error ?? new Error('Unknown error during tarball bundle finalization')
      } else {
        throw error
      }
    }
  }

  if (featureFlags.edge_bundler_dry_run_generate_tarball) {
    let tarballLogMsg: string | undefined
    if (tarballDryRunError) {
      if (tarballDryRunError instanceof Error) {
        tarballLogMsg = `Dry run: Eszip successful, tarball bundle generation failed: ${tarballDryRunError.message}`
      } else {
        tarballLogMsg = `Dry run: Eszip successful, tarball bundle generation failed: ${String(tarballDryRunError as unknown)}`
      }
    } else {
      tarballLogMsg = 'Dry run: Eszip and tarball bundle generated successfully.'
    }
    if (tarballLogMsg) {
      // Log tarball generation status after eszip bundling succeeds (only set during dry runs).
      // Reported errors might be multiple lines, so we replace newlines with the literal string '\n' to get a single log line,
      // while still ensuring it could be expanded into the original multi-line message if needed.
      logger.system(tarballLogMsg.replaceAll('\n', '\\n'))
    }
  }

  // The final file name of the bundles contains a SHA256 hash of the contents,
  // which we can only compute now that the files have been generated. So let's
  // rename the bundles to their permanent names.
  await createFinalBundles(bundles, distDirectory, buildID)

  const manifest = await writeManifest({
    bundles,
    distDirectory,
    featureFlags,
    functions,
    manifestFunctionConfig,
    manifestRoutes,
    importMap: importMapSpecifier,
    layers: deployConfig.layers,
    bundlingTiming: tarballBundleDurationMs === undefined ? undefined : { tarball_ms: tarballBundleDurationMs },
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
  // A function may have several declarations — for example, one synthesized
  // from its in-source config and one coming from `netlify.toml` or the
  // Frameworks API. Only the latter can carry `name` and `generator`, so we
  // look for each field across all of the function's declarations rather than
  // just the first one, which may well be the in-source one.
  const functionDeclarations = declarations?.filter((decl) => decl.function === functionName) ?? []

  return {
    ...config,
    name: functionDeclarations.find((decl) => decl.name)?.name || config.name,
    generator: functionDeclarations.find((decl) => decl.generator)?.generator || config.generator,
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
