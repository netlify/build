import { promises as fs } from 'fs'
import { dirname, join, resolve } from 'path'

import { bundle, find } from '@netlify/edge-bundler'
import { pathExists } from 'path-exists'

import { logFunctionsToBundle } from '../../log/messages/core_steps.js'

import { parseManifest } from './lib/internal_manifest.js'

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
  featureFlags,
  logs,
  netlifyConfig,
}) {
  const { edge_functions: configDeclarations = [] } = netlifyConfig
  const distPath = resolve(buildDir, distDirectory)
  const internalSrcPath = resolve(buildDir, internalSrcDirectory)
  const distImportMapPath = join(dirname(internalSrcPath), IMPORT_MAP_FILENAME)
  const srcPath = srcDirectory ? resolve(buildDir, srcDirectory) : undefined
  const sourcePaths = [internalSrcPath, srcPath].filter(Boolean)

  logFunctions({ internalSrcDirectory, internalSrcPath, logs, srcDirectory, srcPath })

  const { declarations: internalDeclarations, importMap } = await parseManifest(internalSrcPath)
  const declarations = [...configDeclarations, ...internalDeclarations]

  // If we're running in buildbot and the feature flag is enabled, we set the
  // Deno cache dir to a directory that is persisted between builds.
  const cacheDirectory =
    !isRunningLocally && featureFlags.edge_functions_cache_cli ? resolve(buildDir, DENO_CLI_CACHE_DIRECTORY) : undefined

  // Edge Bundler expects the dist directory to exist.
  await fs.mkdir(distPath, { recursive: true })

  await bundle(sourcePaths, distPath, declarations, {
    cacheDirectory,
    debug,
    distImportMapPath,
    featureFlags,
    importMaps: [importMap].filter(Boolean),
  })

  return {}
}

// We run this core step if at least one of the functions directories (the
// one configured by the user or the internal one) exists. We use a dynamic
// `condition` because the directories might be created by the build command
// or plugins.
const hasEdgeFunctionsDirectories = async function ({
  buildDir,
  constants: { INTERNAL_EDGE_FUNCTIONS_SRC, EDGE_FUNCTIONS_SRC },
}) {
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
}) => {
  const [userFunctions, internalFunctions] = await Promise.all([find([srcPath]), find([internalSrcPath])])
  const userFunctionsSrcExists = await pathExists(srcPath)
  const internalFunctionsSrc = internalSrcDirectory

  logFunctionsToBundle({
    logs,
    userFunctions: userFunctions.map(({ name }) => name),
    userFunctionsSrc,
    userFunctionsSrcExists,
    internalFunctions: internalFunctions.map(({ name }) => name),
    internalFunctionsSrc,
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
