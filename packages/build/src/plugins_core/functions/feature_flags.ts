import type { FeatureFlags } from '../../core/feature_flags.js'

export const getZisiFeatureFlags = (featureFlags: FeatureFlags): FeatureFlags => ({
  ...featureFlags,
  // zip-it-and-ship-it reads a missing flag as its `false` default
  traceWithNft: featureFlags['buildbot_zisi_trace_nft'] ?? false,
})
