export const getZisiFeatureFlags = (featureFlags) => ({
  ...featureFlags,
  defaultEsModulesToEsbuild: featureFlags.buildbot_es_modules_esbuild,
  parseWithEsbuild: featureFlags.buildbot_zisi_esbuild_parser,
  traceWithNft: featureFlags.buildbot_zisi_trace_nft,
})
