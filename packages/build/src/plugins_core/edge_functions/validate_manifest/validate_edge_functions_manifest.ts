import { promises as fs } from 'fs'
import { join, resolve } from 'path'

import { ManifestValidationError, validateManifest } from '@netlify/edge-bundler'

import type { FeatureFlags } from '../../../core/feature_flags.js'
import { tagBundlingError } from '../lib/error.js'

export const validateEdgeFunctionsManifest = async function ({
  buildDir,
  constants: { EDGE_FUNCTIONS_DIST: distDirectory },
  featureFlags,
}: {
  buildDir: string
  constants: { EDGE_FUNCTIONS_DIST: string }
  featureFlags: FeatureFlags
}) {
  const edgeFunctionsDistPath = resolve(buildDir, distDirectory)
  const manifestPath = join(edgeFunctionsDistPath, 'manifest.json')
  const data = await fs.readFile(manifestPath)
  // @ts-expect-error TypeScript is not aware that parse can handle Buffer
  const manifestData = JSON.parse(data)

  try {
    validateManifest(manifestData, featureFlags)
  } catch (error) {
    if (error instanceof ManifestValidationError) {
      tagBundlingError(error)
    }

    throw error
  }

  return {}
}
