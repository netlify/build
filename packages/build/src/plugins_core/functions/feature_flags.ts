import type { FeatureFlags } from '../../core/feature_flags.js'

export const getZisiFeatureFlags = (featureFlags: FeatureFlags): FeatureFlags => ({
  ...featureFlags,
  traceWithNft: featureFlags.buildbot_zisi_trace_nft,
})
