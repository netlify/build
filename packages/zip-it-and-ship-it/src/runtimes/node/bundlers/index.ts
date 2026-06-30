import { extname } from 'path'

import { FunctionConfig } from '../../../config.js'
import { FeatureFlags } from '../../../feature_flags.js'
import { detectEsModule } from '../utils/detect_es_module.js'
import { MODULE_FILE_EXTENSION } from '../utils/module_format.js'

import esbuildBundler from './esbuild/index.js'
import nftBundler from './nft/index.js'
import noBundler from './none/index.js'
import { BUNDLER_REASON, NODE_BUNDLER } from './types.js'
import type { BundlerReason, NodeBundler, NodeBundlerName } from './types.js'
import zisiBundler from './zisi/index.js'

export const getBundler = (name: NodeBundlerName): NodeBundler => {
  switch (name) {
    case NODE_BUNDLER.ESBUILD:
    case NODE_BUNDLER.ESBUILD_ZISI:
      return esbuildBundler

    case NODE_BUNDLER.NFT:
      return nftBundler

    case NODE_BUNDLER.ZISI:
      return zisiBundler

    case NODE_BUNDLER.NONE:
      return noBundler

    default:
      throw new Error(`Unsupported Node bundler: ${name}`)
  }
}

export const getBundlerName = async ({
  config: { nodeBundler },
  extension,
  featureFlags,
  mainFile,
  runtimeAPIVersion,
}: {
  config: FunctionConfig
  extension: string
  featureFlags: FeatureFlags
  mainFile: string
  runtimeAPIVersion: number
}): Promise<{ name: NodeBundlerName; reason: BundlerReason }> => {
  // For V2 functions, we force the bundler to NFT. The only exception is when
  // a `none` override was provided.
  if (runtimeAPIVersion === 2) {
    return nodeBundler === NODE_BUNDLER.NONE
      ? { name: NODE_BUNDLER.NONE, reason: BUNDLER_REASON.NoneOverride }
      : { name: NODE_BUNDLER.NFT, reason: BUNDLER_REASON.V2Default }
  }

  if (nodeBundler) {
    return { name: nodeBundler, reason: BUNDLER_REASON.ConfigOverride }
  }

  return await getDefaultBundler({ extension, featureFlags, mainFile })
}

const ESBUILD_EXTENSIONS = new Set(['.mjs', '.ts', '.tsx', '.cts', '.mts'])

// We use ZISI as the default bundler, except for certain extensions, for which
// esbuild is the only option.
const getDefaultBundler = async ({
  extension,
  featureFlags,
  mainFile,
}: {
  extension: string
  mainFile: string
  featureFlags: FeatureFlags
}): Promise<{ name: NodeBundlerName; reason: BundlerReason }> => {
  if (extension === MODULE_FILE_EXTENSION.MJS && featureFlags.zisi_pure_esm_mjs) {
    return { name: NODE_BUNDLER.NFT, reason: BUNDLER_REASON.MjsPureEsm }
  }

  if (ESBUILD_EXTENSIONS.has(extension)) {
    return { name: NODE_BUNDLER.ESBUILD, reason: BUNDLER_REASON.EsbuildExtension }
  }

  if (featureFlags.traceWithNft) {
    return { name: NODE_BUNDLER.NFT, reason: BUNDLER_REASON.FlagForcedNft }
  }

  const functionIsESM = extname(mainFile) !== MODULE_FILE_EXTENSION.CJS && (await detectEsModule({ mainFile }))

  return functionIsESM
    ? { name: NODE_BUNDLER.NFT, reason: BUNDLER_REASON.EsmDefault }
    : { name: NODE_BUNDLER.ZISI, reason: BUNDLER_REASON.ZisiDefault }
}
