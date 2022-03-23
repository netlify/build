import { dirname, join, resolve } from 'path'

import { bundle } from '@netlify-labs/edge-bundler'
import { pathExists } from 'path-exists'

import { parseManifest } from './lib/internal_manifest.js'

const coreStep = async function ({
  buildDir,
  constants: {
    EDGE_HANDLERS_DIST: distDirectory,
    EDGE_HANDLERS_SRC: srcDirectory,
    INTERNAL_EDGE_HANDLERS_SRC: internalSrcDirectory,
  },
  netlifyConfig,
}) {
  const { edge_handlers: configDeclarations = [] } = netlifyConfig
  const edgeHandlersDistPath = resolve(buildDir, distDirectory)
  const internalSourcePath = resolve(buildDir, internalSrcDirectory)
  const distImportMapPath = join(dirname(internalSourcePath), 'edge-handlers-import-map.json')
  const sourcePaths = [internalSourcePath, srcDirectory && resolve(srcDirectory)].filter(Boolean)
  const { declarations: internalDeclarations, importMap } = await parseManifest(internalSourcePath)
  const declarations = [...configDeclarations, ...internalDeclarations]

  await bundle(sourcePaths, edgeHandlersDistPath, declarations, {
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
  constants: { INTERNAL_EDGE_HANDLERS_SRC, EDGE_HANDLERS_SRC },
}) {
  const hasFunctionsSrc = EDGE_HANDLERS_SRC !== undefined && EDGE_HANDLERS_SRC !== ''

  if (hasFunctionsSrc) {
    return true
  }

  const internalFunctionsSrc = resolve(buildDir, INTERNAL_EDGE_HANDLERS_SRC)

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
