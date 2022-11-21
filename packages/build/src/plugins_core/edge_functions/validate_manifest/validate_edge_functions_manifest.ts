import { promises as fs } from 'fs'
import { join, resolve } from 'path'

import { ManifestValidationError, validateManifest } from '@netlify/edge-bundler'

import { addErrorInfo } from '../../../error/info.js'

export const validateEdgeFunctionsManifest = async function ({
  buildDir,
  constants: { EDGE_FUNCTIONS_DIST: distDirectory },
}: {
  buildDir: string
  constants: { EDGE_FUNCTIONS_DIST: string }
}) {
  const edgeFunctionsDistPath = resolve(buildDir, distDirectory)
  const manifestPath = join(edgeFunctionsDistPath, 'manifest.json')
  const data = await fs.readFile(manifestPath)
  // @ts-expect-error TypeScript is not aware that parse can handle Buffer
  const manifestData = JSON.parse(data)

  try {
    validateManifest(manifestData)
  } catch (error) {
    if (error instanceof ManifestValidationError) {
      addErrorInfo(error, { type: 'coreStep' })
    }

    throw error
  }

  return {}
}
