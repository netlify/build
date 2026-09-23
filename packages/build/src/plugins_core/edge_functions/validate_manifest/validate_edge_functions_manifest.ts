import { ManifestValidationError, validateManifest } from '@netlify/edge-bundler'

import type { FeatureFlags } from '../../../core/feature_flags.js'
import { tagBundlingError } from '../lib/error.js'

// Callers expect validation errors as a rejection, which a throwing executor gives
export const validateEdgeFunctionsManifest = function (
  manifest: unknown,
  featureFlags?: FeatureFlags,
): Promise<object> {
  return new Promise((resolve) => {
    try {
      validateManifest(manifest, featureFlags)
    } catch (error) {
      if (error instanceof ManifestValidationError) {
        tagBundlingError(error)
      }

      throw error
    }

    resolve({})
  })
}
