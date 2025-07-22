import { ExtensionResponse } from './types/api.js'
import { Extension } from './types/extensions.js'

export const NETLIFY_API_STAGING_BASE_URL = 'api-staging.netlify.com'
export const NETLIFY_API_BASE_URL = 'api.netlify.com'
export const EXTENSION_API_BASE_URL = 'https://api.netlifysdk.com'
export const EXTENSION_API_STAGING_BASE_URL = 'https://api-staging.netlifysdk.com'

export type MergeExtensionsOptions = {
  /**
   * Extensions loaded via the Netlify API. These are extensions enabled
   */
  apiExtensions: ExtensionResponse[]
  /**
   * Development extensions loaded via the build target's netlify.toml file. Only used when the
   * build context is set to `dev` (e.g. when `netlify build` is run with `--context=dev`).
   */
  configExtensions?: { name: string; dev?: { path: string; force_run_in_build?: boolean } }[]
  /**
   * The current build context, set e.g. via `netlify build --context=<context>`.
   */
  context: string
}

/**
 * mergeExtensions accepts several lists of extensions configured for the current build target and
 * stitches them together into a single list. It performs filtration depending on the current build
 * context and merges development-time information set via the configuration file (netlify.toml)
 * with canonical information retrieved from the Netlify API.
 */
export const mergeExtensions = ({
  configExtensions = [],
  apiExtensions,
  context,
}: MergeExtensionsOptions): Extension[] => {
  const apiExtensionsBySlug = new Map(apiExtensions.map((extension) => [extension.slug, extension]))
  const configExtensionsBySlug = new Map(
    // Only use configuration-file data in development mode
    (context === 'dev' ? configExtensions : []).map((extension) => [extension.name, extension]),
  )
  const extensionSlugs = new Set([...apiExtensionsBySlug.keys(), ...configExtensionsBySlug.keys()])

  // Merge API and configuration file metadata together by merging development metadata onto API
  // metadata.
  //
  // Explicitly allow the configuration file to reference an extension that doesn't yet exist in the
  // API so users can test their build hooks without publishing the extension first.
  return [...extensionSlugs]
    .map((slug) => [slug, apiExtensionsBySlug.get(slug), configExtensionsBySlug.get(slug)] as const)
    .map<Extension>(([slug, apiExtension, configExtension]) => ({
      ...apiExtension,
      dev: configExtension?.dev,
      slug,
      has_build: apiExtension?.has_build ?? configExtension?.dev?.force_run_in_build ?? false,
    }))
}
