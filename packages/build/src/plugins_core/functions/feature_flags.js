export const getZisiFeatureFlags = (featureFlags) => ({
  ...featureFlags,
  buildGoSource: featureFlags.buildbot_build_go_functions,
  defaultEsModulesToEsbuild: featureFlags.buildbot_es_modules_esbuild,
  nftTranspile: featureFlags.buildbot_nft_transpile_esm || featureFlags.buildbot_zisi_trace_nft,
  parseISC: featureFlags.zisi_parse_isc,
  parseWithEsbuild: featureFlags.buildbot_zisi_esbuild_parser,
  traceWithNft: featureFlags.buildbot_zisi_trace_nft,
})
