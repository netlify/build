'use strict'

const getZisiFeatureFlags = (featureFlags) => ({
  buildGoSource: featureFlags.buildbot_build_go_functions,
  defaultEsModulesToEsbuild: featureFlags.buildbot_es_modules_esbuild,
  parseWithEsbuild: featureFlags.buildbot_zisi_esbuild_parser,
  traceWithNft: featureFlags.buildbot_zisi_trace_nft,
})

module.exports = { getZisiFeatureFlags }
