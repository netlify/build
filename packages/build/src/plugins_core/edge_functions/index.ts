import { promises as fs } from 'fs'
import { dirname, join, resolve } from 'path'

import { bundle, find } from '@netlify/edge-bundler'
import { pathExists } from 'path-exists'

import { Metric } from '../../core/report_metrics.js'
import { log, reduceLogLines, structuredLog } from '../../log/logger.js'
import { logFunctionsToBundle } from '../../log/messages/core_steps.js'
import {
  FRAMEWORKS_API_EDGE_FUNCTIONS_PATH,
  FRAMEWORKS_API_EDGE_FUNCTIONS_IMPORT_MAP,
} from '../../utils/frameworks_api.js'

import { tagBundlingError } from './lib/error.js'
import { validateEdgeFunctionsManifest } from './validate_manifest/validate_edge_functions_manifest.js'

// TODO: Replace this with a custom cache directory.
const DENO_CLI_CACHE_DIRECTORY = '.netlify/plugins/deno-cli'
const IMPORT_MAP_FILENAME = 'edge-functions-import-map.json'

const coreStep = async function ({
  buildDir,
  packagePath,
  constants: {
    EDGE_FUNCTIONS_DIST: distDirectory,
    EDGE_FUNCTIONS_SRC: srcDirectory,
    INTERNAL_EDGE_FUNCTIONS_SRC: internalSrcDirectory,
    IS_LOCAL: isRunningLocally,
  },
  debug,
  systemLog,
  featureFlags,
  logs,
  netlifyConfig,
  edgeFunctionsBootstrapURL,
}: {
  buildDir: string
  packagePath: string
  constants: Record<string, string | boolean>
  debug: boolean
  systemLog(...args: any[]): void
  featureFlags: Record<string, any>
  logs: any
  netlifyConfig: any
  edgeFunctionsBootstrapURL?: string
}) {
  const { edge_functions: declarations = [], functions } = netlifyConfig
  const { deno_import_map: userDefinedImportMap } = functions['*']
  const importMapPaths: string[] = [userDefinedImportMap]
  const distPath = resolve(buildDir, distDirectory)
  const internalSrcPath = resolve(buildDir, internalSrcDirectory)
  const distImportMapPath = join(dirname(internalSrcPath), IMPORT_MAP_FILENAME)
  const srcPath = srcDirectory ? resolve(buildDir, srcDirectory) : undefined
  const frameworksAPISrcPath = resolve(buildDir, packagePath || '', FRAMEWORKS_API_EDGE_FUNCTIONS_PATH)
  const generatedFunctionPaths = [internalSrcPath]

  if (await pathExists(frameworksAPISrcPath)) {
    generatedFunctionPaths.push(frameworksAPISrcPath)
  }

  const frameworkImportMap = resolve(
    buildDir,
    packagePath || '',
    FRAMEWORKS_API_EDGE_FUNCTIONS_PATH,
    FRAMEWORKS_API_EDGE_FUNCTIONS_IMPORT_MAP,
  )

  if (await pathExists(frameworkImportMap)) {
    importMapPaths.push(frameworkImportMap)
  }

  const sourcePaths = [...generatedFunctionPaths, srcPath].filter(Boolean) as string[]

  const [userFunctionsSrcExists, userFunctions, internalFunctions, frameworkFunctions] = await Promise.all([
    srcPath ? pathExists(srcPath) : Promise.resolve(false),
    srcPath ? find([srcPath]) : Promise.resolve([]),
    find([internalSrcPath]),
    frameworksAPISrcPath ? find([frameworksAPISrcPath]) : Promise.resolve([]),
  ])

  logFunctionsToBundle({
    logs,
    userFunctions: userFunctions.map(({ name }) => name),
    userFunctionsSrc: srcDirectory,
    userFunctionsSrcExists,
    internalFunctions: internalFunctions.map(({ name }) => name),
    internalFunctionsSrc: internalSrcDirectory,
    frameworkFunctions: frameworkFunctions.map(({ name }) => name),
    type: 'Edge Functions',
    generatedFunctions: {},
  })

  // If we're running in buildbot, we set the Deno cache dir to a directory
  // that is persisted between builds.
  const cacheDirectory = !isRunningLocally ? resolve(buildDir, DENO_CLI_CACHE_DIRECTORY) : undefined

  // Cleaning up the dist directory, in case it has any artifacts from previous
  // builds.
  try {
    await fs.rm(distPath, { recursive: true })
  } catch {
    // no-op
  }

  if (userFunctions.length === 0 && internalFunctions.length === 0 && frameworkFunctions.length === 0) {
    return {}
  }

  let vendorDirectory: string | undefined

  // If we're building locally, set a vendor directory in `internalSrcPath`.
  // This makes Edge Bundler keep the vendor files around after the build,
  // which lets the IDE have a valid reference to them.
  if (isRunningLocally && featureFlags.edge_functions_npm_modules) {
    vendorDirectory = join(internalSrcPath, '.vendor')

    await fs.mkdir(vendorDirectory, { recursive: true })
  }

  // Ensuring the dist directory actually exists before letting Edge Bundler
  // write to it.
  await fs.mkdir(distPath, { recursive: true })

  try {
    const { manifest } = await bundle(sourcePaths, distPath, declarations, {
      basePath: buildDir,
      cacheDirectory,
      configPath: join(internalSrcPath, 'manifest.json'),
      debug,
      distImportMapPath,
      featureFlags,
      importMapPaths,
      userLogger: (...args) => log(logs, reduceLogLines(args)),
      systemLogger: systemLog,
      internalSrcFolder: generatedFunctionPaths,
      bootstrapURL: edgeFunctionsBootstrapURL,
      vendorDirectory,
    })
    const metrics = getMetrics(manifest)

    systemLog('Edge Functions manifest:', manifest)

    // Log bundled edge functions and their configuration
    structuredLog({
      logs,
      type: 'edge-functions-bundling',
      payload: {
        functions: Object.entries(manifest.function_config).map(([name, config]: [string, any]) => ({
          name,
          generator: config.generator,
          path: config.path,
        })),
        routes: manifest.routes,
        postCacheRoutes: manifest.post_cache_routes,
      },
      isRunningLocally: Boolean(isRunningLocally),
      featureFlags,
    })

    await validateEdgeFunctionsManifest(manifest, featureFlags)
    return { metrics }
  } catch (error) {
    tagBundlingError(error)

    throw error
  }
}

const getMetrics = (manifest): Metric[] => {
  const numGenEfs = Object.values(manifest.function_config).filter(
    (config: { generator?: string }) => config.generator,
  ).length
  const allRoutes = [...manifest.routes, ...manifest.post_cache_routes]
  const totalEfs = [] as string[]

  allRoutes.forEach((route) => {
    if (!totalEfs.some((func) => func === route.function)) {
      totalEfs.push(route.function)
    }
  })

  const numUserEfs = totalEfs.length - numGenEfs

  const metrics: Metric[] = [
    { type: 'increment', name: 'buildbot.build.functions', value: numGenEfs, tags: { type: 'edge:generated' } },
    { type: 'increment', name: 'buildbot.build.functions', value: numUserEfs, tags: { type: 'edge:user' } },
  ]

  const tarballDurationMs = manifest.bundling_timing?.tarball_ms

  if (typeof tarballDurationMs === 'number') {
    metrics.push({
      type: 'timing',
      name: 'buildbot.build.edge_functions.bundling_ms',
      value: tarballDurationMs,
      tags: { format: 'tarball' },
    })
  }

  return metrics
}
// We run this core step if at least one of the functions directories (the
// one configured by the user or the internal one) exists. We use a dynamic
// `condition` because the directories might be created by the build command
// or plugins.
const hasEdgeFunctionsDirectories = async function ({
  buildDir,
  constants: { INTERNAL_EDGE_FUNCTIONS_SRC, EDGE_FUNCTIONS_SRC },
  packagePath,
}): Promise<boolean> {
  const hasFunctionsSrc = EDGE_FUNCTIONS_SRC !== undefined && EDGE_FUNCTIONS_SRC !== ''

  if (hasFunctionsSrc) {
    return true
  }

  const internalFunctionsSrc = resolve(buildDir, INTERNAL_EDGE_FUNCTIONS_SRC)

  if (await pathExists(internalFunctionsSrc)) {
    return true
  }

  const frameworkFunctionsSrc = resolve(buildDir, packagePath || '', FRAMEWORKS_API_EDGE_FUNCTIONS_PATH)

  return await pathExists(frameworkFunctionsSrc)
}

export const bundleEdgeFunctions = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'edge_functions_bundling',
  coreStepName: 'Edge Functions bundling',
  coreStepDescription: () => 'Edge Functions bundling',
  condition: hasEdgeFunctionsDirectories,
}
