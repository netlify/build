import { DVCUser, initialize } from '@devcycle/nodejs-server-sdk'

/** Get a list of feature flags for a provided user */
export async function getFeatureFlags(user?: DVCUser): Promise<Record<string, boolean>> {
  try {
    if (!process.env.DEV_CYCLE_KEY || !user?.user_id) {
      return {}
    }

    const dvcClient = await initialize(process.env.DEV_CYCLE_KEY).onClientInitialized()
    const features = dvcClient.allFeatures(user)

    return Object.values(features || {}).reduce((prev, feature) => ({ ...prev, [feature.key]: true }), {})
  } catch {
    return {}
  }
}
