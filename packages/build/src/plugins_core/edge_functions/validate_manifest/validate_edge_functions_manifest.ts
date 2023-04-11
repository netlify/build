import { ManifestValidationError, validateManifest } from '@netlify/edge-bundler'

import type { FeatureFlags } from '../../../core/feature_flags.js'
import { tagBundlingError } from '../lib/error.js'

export const validateEdgeFunctionsManifest = async function (manifest, featureFlags?: FeatureFlags) {
  try {
    validateManifest(manifest, featureFlags)
  } catch (error) {
    if (error instanceof ManifestValidationError) {
      tagBundlingError(error)
    }

    throw error
  }

  return {}
}
