import { DVCUser, initialize } from '@devcycle/nodejs-server-sdk'

export type FeatureFlags = Record<string, boolean>

// From CLI `--featureFlags=a,b,c` to programmatic `{ a: true, b: true, c: true }`
export const normalizeCliFeatureFlags = function (cliFeatureFlags: string): FeatureFlags {
  return Object.assign({}, ...cliFeatureFlags.split(',').filter(isNotEmpty).map(getFeatureFlag))
}

const isNotEmpty = function (name: string): boolean {
  return name.trim() !== ''
}

const getFeatureFlag = function (name: string): FeatureFlags {
  return { [name]: true }
}

// Default values for feature flags
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  buildbot_zisi_trace_nft: false,
  buildbot_zisi_esbuild_parser: false,
  edge_functions_cache_cli: false,
  edge_functions_system_logger: false,
}

/** Get a list of feature flags */
export async function getFeatureFlags(LDFeatureFlags: string, user?: DVCUser): Promise<FeatureFlags> {
  const ldParsed = normalizeCliFeatureFlags(LDFeatureFlags)

  try {
    if (!ldParsed['netlify-build-use-dev-cycle'] || !process.env.DEV_CYCLE_KEY || !user?.user_id) {
      return ldParsed
    }

    const dvcClient = await initialize(process.env.DEV_CYCLE_KEY).onClientInitialized()
    const features = dvcClient.allFeatures(user)

    return Object.values(features || {}).reduce((prev, feature) => ({ ...prev, [feature.key]: true }), ldParsed)
  } catch {
    return ldParsed
  }
}
