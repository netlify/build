import fetch from 'node-fetch'

import { TestOptions } from '../types/options.js'

type AvailableIntegration = { slug: string; hostSiteUrl: string; hasBuild?: boolean }

type GetAvailableIntegrationsOpts = { testOpts: TestOptions; offline: boolean; netlifyApiHost: string }

export const getAvailableIntegrations = async function ({
  testOpts,
  offline,
  netlifyApiHost,
}: GetAvailableIntegrationsOpts): Promise<AvailableIntegration[]> {
  if (offline) {
    return []
  }
  const { host } = testOpts
  const extensionApiBaseUrl =
    netlifyApiHost === 'api.netlify.com' ? 'https://api.netlifysdk.com/' : `https://api-staging.netlifysdk.com/`
  const baseUrl = new URL(host ? `http://${host}/` : extensionApiBaseUrl)

  try {
    const response = await fetch(`${baseUrl}integrations`)

    if (response.ok) {
      const integrations = (await response.json()) as AvailableIntegration[]
      return Array.isArray(integrations) ? integrations : []
    }

    return []
  } catch {
    return []
  }
}
