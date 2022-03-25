import { dirname, join, resolve } from 'path'

import { bundle } from '@netlify-labs/edge-bundler'
import { pathExists } from 'path-exists'

import { parseManifest } from './lib/internal_manifest.js'

const IMPORT_MAP_FILENAME = 'edge-functions-import-map.json'

const coreStep = async function ({
  buildDir,
  constants: {
    EDGE_FUNCTIONS_DIST: distDirectory,
    EDGE_FUNCTIONS_SRC: srcDirectory,
    INTERNAL_EDGE_FUNCTIONS_SRC: internalSrcDirectory,
  },
  netlifyConfig,
}) {
  const { edge_functions: configDeclarations = [] } = netlifyConfig
  const distPath = resolve(buildDir, distDirectory)
  const internalSourcePath = resolve(buildDir, internalSrcDirectory)
  const distImportMapPath = join(dirname(internalSourcePath), IMPORT_MAP_FILENAME)
  const sourcePaths = [internalSourcePath, srcDirectory && resolve(srcDirectory)].filter(Boolean)
  const { declarations: internalDeclarations, importMap } = await parseManifest(internalSourcePath)
  const declarations = [...configDeclarations, ...internalDeclarations]

  await bundle(sourcePaths, distPath, declarations, {
    distImportMapPath,
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

export const bundleEdgeFunctions = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'edge_functions_bundling',
  coreStepName: 'Edge Functions bundling',
  coreStepDescription: () => 'Edge Functions bundling',
  condition: hasEdgeFunctionsDirectories,
}
