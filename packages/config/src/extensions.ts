import { type Extension } from './api/site_info.js'

export const NETLIFY_API_STAGING_BASE_URL = 'api-staging.netlify.com'
export const NETLIFY_API_BASE_URL = 'api.netlify.com'
export const EXTENSION_API_BASE_URL = 'https://api.netlifysdk.com'
export const EXTENSION_API_STAGING_BASE_URL = 'https://api-staging.netlifysdk.com'

export type MergeExtensionsOptions = {
  /**
   * Extensions loaded via the Netlify API. These are extensions enabled
   */
  apiExtensions: Extension[]
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

export type ExtensionWithDev = Extension & {
  dev?: { path: string; force_run_in_build?: boolean } | undefined
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
}: MergeExtensionsOptions): ExtensionWithDev[] => {
  const apiExtensionsBySlug = new Map<string, Extension>(apiExtensions.map((extension) => [extension.slug, extension]))
  const configExtensionsBySlug = new Map<
    string,
    Omit<Extension, 'author' | 'extension_token' | 'version'> &
      Partial<Pick<Extension, 'author' | 'extension_token' | 'version'>> & {
        dev?: { path: string; force_run_in_build?: boolean } | undefined
      }
  >(
    // Only use configuration-file data in development mode
    (context === 'dev' ? configExtensions : []).map((extension) => [
      extension.name,
      // Normalize dev extensions to a similar shape as an API extension
      {
        author: undefined,
        dev: extension.dev,
        extension_token: undefined,
        has_build: extension.dev?.force_run_in_build ?? false,
        name: extension.name,
        slug: extension.name,
        version: undefined,
      },
    ]),
  )

  // Merge API and configuration file metadata together by merging development metadata onto API
  // metadata.
  //
  // Explicitly allow the configuration file to reference an extension that doesn't yet exist in the
  // API so users can test their build hooks without publishing the extension first.
  return [...new Set([...apiExtensionsBySlug.keys(), ...configExtensionsBySlug.keys()])]
    .map((slug) => [apiExtensionsBySlug.get(slug), configExtensionsBySlug.get(slug)] as const)
    .map(([apiExtension, configExtension]) => ({
      author: configExtension?.author ?? apiExtension?.author ?? '',
      dev: configExtension?.dev,
      extension_token: configExtension?.extension_token ?? apiExtension?.extension_token ?? '',
      has_build: configExtension?.has_build ?? apiExtension?.has_build ?? false,
      name: configExtension?.name ?? apiExtension?.name ?? '',
      slug: configExtension?.slug ?? apiExtension?.slug ?? '',
      version: configExtension?.version ?? apiExtension?.version ?? '',
    }))
}
