import { IntegrationResponse } from './types/api.js'
import { Integration } from './types/integrations.js'

export const NETLIFY_API_STAGING_BASE_URL = 'api-staging.netlify.com'
export const NETLIFY_API_BASE_URL = 'api.netlify.com'
export const EXTENSION_API_BASE_URL = 'https://api.netlifysdk.com'
export const EXTENSION_API_STAGING_BASE_URL = 'https://api-staging.netlifysdk.com'

type MergeIntegrationsOpts = {
  configIntegrations?: { name: string; dev?: { path: string; force_run_in_build?: boolean } }[]
  apiIntegrations: IntegrationResponse[]
  context: string
}

export const mergeIntegrations = async function ({
  configIntegrations = [],
  apiIntegrations,
  context,
}: MergeIntegrationsOpts): Promise<Integration[]> {
  // Include all API integrations, unless they have a `dev` property and we are in the `dev` context
  const resolvedApiIntegrations = apiIntegrations.filter(
    (integration) =>
      !configIntegrations.some(
        (configIntegration) =>
          configIntegration.name === integration.slug &&
          typeof configIntegration.dev !== 'undefined' &&
          context === 'dev',
      ),
  )

  // For integrations loaded from the TOML, we will use the local reference in the `dev` context,
  // otherwise we will fetch from the API and match the slug
  const resolvedConfigIntegrations = configIntegrations
    .filter(
      (configIntegration) =>
        apiIntegrations.every((apiIntegration) => apiIntegration.slug !== configIntegration.name) ||
        ('dev' in configIntegration && context === 'dev'),
    )
    .map((configIntegration) => {
      const apiIntegration = apiIntegrations.find((apiIntegration) => apiIntegration.slug === configIntegration.name)

      if (configIntegration.dev && context === 'dev') {
        return {
          slug: configIntegration.name,
          dev: configIntegration.dev,
          // TODO(kh): has_build should become irrelevant soon as we are only returning extensions that have a build event handler.
          has_build: apiIntegration?.has_build ?? configIntegration.dev?.force_run_in_build ?? false,
          ...apiIntegration,
        }
      }

      if (!apiIntegration) {
        return undefined
      }

      return apiIntegration
    })
    .filter((i): i is IntegrationResponse => typeof i !== 'undefined')

  return [...resolvedApiIntegrations, ...resolvedConfigIntegrations]
}
