import type { FeatureFlags } from '../../core/feature_flags.js'

export const getZisiFeatureFlags = (featureFlags: FeatureFlags): FeatureFlags => ({
  ...featureFlags,
  parseWithEsbuild: featureFlags.buildbot_zisi_esbuild_parser,
  traceWithNft: featureFlags.buildbot_zisi_trace_nft,
})
