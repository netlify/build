export const getZisiFeatureFlags = (featureFlags) => ({
  ...featureFlags,
  parseWithEsbuild: featureFlags.buildbot_zisi_esbuild_parser,
  traceWithNft: featureFlags.buildbot_zisi_trace_nft,
})
