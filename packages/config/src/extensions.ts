import { ExtensionResponse } from './types/api.js'
import { Extension } from './types/extensions.js'

export const NETLIFY_API_STAGING_BASE_URL = 'api-staging.netlify.com'
export const NETLIFY_API_BASE_URL = 'api.netlify.com'
export const EXTENSION_API_BASE_URL = 'https://api.netlifysdk.com'
export const EXTENSION_API_STAGING_BASE_URL = 'https://api-staging.netlifysdk.com'

type MergeExtensionsOptions = {
  apiExtensions: ExtensionResponse[]
  configExtensions?: { name: string; dev?: { path: string; force_run_in_build?: boolean } }[]
  context: string
}

export const mergeExtensions = function ({
  configExtensions = [],
  apiExtensions,
  context,
}: MergeExtensionsOptions): Extension[] {
  // Include all API extensions, unless they have a `dev` property and we are in the `dev` context
  const resolvedApiExtensions = apiExtensions.filter(
    (extension) =>
      !configExtensions.some(
        (configExtension) =>
          configExtension.name === extension.slug && typeof configExtension.dev !== 'undefined' && context === 'dev',
      ),
  )

  // For extensions loaded from the TOML, we will use the local reference in the `dev` context,
  // otherwise we will fetch from the API and match the slug
  const resolvedConfigExtensions = configExtensions
    .filter(
      (configExtension) =>
        apiExtensions.every((apiExtension) => apiExtension.slug !== configExtension.name) ||
        ('dev' in configExtension && context === 'dev'),
    )
    .map((configExtension) => {
      const apiExtension = apiExtensions.find((apiExtension) => apiExtension.slug === configExtension.name)

      if (configExtension.dev && context === 'dev') {
        return {
          slug: configExtension.name,
          dev: configExtension.dev,
          // TODO(kh): has_build should become irrelevant soon as we are only returning extensions that have a build event handler.
          has_build: apiExtension?.has_build ?? configExtension.dev.force_run_in_build ?? false,
          ...apiExtension,
        }
      }

      if (!apiExtension) {
        return undefined
      }

      return apiExtension
    })
    .filter((i): i is ExtensionResponse => i !== undefined)

  return [...resolvedApiExtensions, ...resolvedConfigExtensions]
}
