import { promises as fs } from 'fs'
import { dirname, join, resolve } from 'path'

import { bundle, find } from '@netlify/edge-bundler'
import { pathExists } from 'path-exists'

import { Metric } from '../../core/report_metrics.js'
import { log, reduceLogLines } from '../../log/logger.js'
import { logFunctionsToBundle } from '../../log/messages/core_steps.js'

import { tagBundlingError } from './lib/error.js'
import { validateEdgeFunctionsManifest } from './validate_manifest/validate_edge_functions_manifest.js'

// TODO: Replace this with a custom cache directory.
const DENO_CLI_CACHE_DIRECTORY = '.netlify/plugins/deno-cli'
const IMPORT_MAP_FILENAME = 'edge-functions-import-map.json'

const coreStep = async function ({
  buildDir,
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
  constants: Record<string, string>
  debug: boolean
  systemLog(...args: any[]): void
  featureFlags: Record<string, any>
  logs: any
  netlifyConfig: any
  edgeFunctionsBootstrapURL?: string
}) {
  const { edge_functions: declarations = [] } = netlifyConfig
  const { deno_import_map: userDefinedImportMap } = netlifyConfig.functions['*']
  const distPath = resolve(buildDir, distDirectory)
  const internalSrcPath = resolve(buildDir, internalSrcDirectory)
  const distImportMapPath = join(dirname(internalSrcPath), IMPORT_MAP_FILENAME)
  const srcPath = srcDirectory ? resolve(buildDir, srcDirectory) : undefined
  const sourcePaths = [internalSrcPath, srcPath].filter(Boolean) as string[]
  logFunctions({ internalSrcDirectory, internalSrcPath, logs, srcDirectory, srcPath })

  // If we're running in buildbot and the feature flag is enabled, we set the
  // Deno cache dir to a directory that is persisted between builds.
  const cacheDirectory =
    !isRunningLocally && featureFlags.edge_functions_cache_cli ? resolve(buildDir, DENO_CLI_CACHE_DIRECTORY) : undefined

  // Cleaning up the dist directory, in case it has any artifacts from previous
  // builds.
  try {
    await fs.rm(distPath, { recursive: true })
  } catch {
    // no-op
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
      importMapPaths: [userDefinedImportMap],
      userLogger: (...args) => log(logs, reduceLogLines(args)),
      systemLogger: featureFlags.edge_functions_system_logger ? systemLog : undefined,
      internalSrcFolder: internalSrcPath,
      bootstrapURL: edgeFunctionsBootstrapURL,
    })
    const metrics = getMetrics(manifest)

    systemLog('Edge Functions manifest:', manifest)

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

  return [
    { type: 'increment', name: 'buildbot.build.functions', value: numGenEfs, tags: { type: 'edge:generated' } },
    { type: 'increment', name: 'buildbot.build.functions', value: numUserEfs, tags: { type: 'edge:user' } },
  ]
}
// We run this core step if at least one of the functions directories (the
// one configured by the user or the internal one) exists. We use a dynamic
// `condition` because the directories might be created by the build command
// or plugins.
const hasEdgeFunctionsDirectories = async function ({
  buildDir,
  constants: { INTERNAL_EDGE_FUNCTIONS_SRC, EDGE_FUNCTIONS_SRC },
}): Promise<boolean> {
  const hasFunctionsSrc = EDGE_FUNCTIONS_SRC !== undefined && EDGE_FUNCTIONS_SRC !== ''

  if (hasFunctionsSrc) {
    return true
  }

  const internalFunctionsSrc = resolve(buildDir, INTERNAL_EDGE_FUNCTIONS_SRC)

  return await pathExists(internalFunctionsSrc)
}

const logFunctions = async ({
  internalSrcDirectory,
  internalSrcPath,
  logs,
  srcDirectory: userFunctionsSrc,
  srcPath,
}: {
  internalSrcDirectory: string
  internalSrcPath: string
  logs: any
  srcDirectory?: string
  srcPath?: string
}): Promise<void> => {
  const [userFunctionsSrcExists, userFunctions, internalFunctions] = await Promise.all([
    srcPath ? pathExists(srcPath) : Promise.resolve(false),
    srcPath ? find([srcPath]) : Promise.resolve([]),
    find([internalSrcPath]),
  ])

  logFunctionsToBundle({
    logs,
    userFunctions: userFunctions.map(({ name }) => name),
    userFunctionsSrc,
    userFunctionsSrcExists,
    internalFunctions: internalFunctions.map(({ name }) => name),
    internalFunctionsSrc: internalSrcDirectory,
    type: 'Edge Functions',
  })
}

export const bundleEdgeFunctions = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'edge_functions_bundling',
  coreStepName: 'Edge Functions bundling',
  coreStepDescription: () => 'Edge Functions bundling',
  condition: hasEdgeFunctionsDirectories,
}
