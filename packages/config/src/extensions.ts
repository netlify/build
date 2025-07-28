import path from 'node:path'

import { type Extension } from './api/site_info.js'
import { throwUserError } from './error.js'

export const NETLIFY_API_STAGING_HOSTNAME = 'api-staging.netlify.com'
export const NETLIFY_API_HOSTNAME = 'api.netlify.com'
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
   * A path to the build target's build directory. We use this in dev mode to resolve non-absolute
   * build plugin paths.
   */
  buildDir: string
  /**
   * The current build context, set e.g. via `netlify build --context=<context>`.
   */
  context: string
}

export type ExtensionWithDev = Extension & {
  buildPlugin: {
    origin: 'local' | 'remote'
    packageURL: URL
  } | null
  dev?: { path: string; force_run_in_build?: boolean } | null
}

/**
 * normalizeAndMergeExtensions accepts several lists of extensions configured for the current build
 * target, normalizes them to compensate for some differences between the various APIs we load this
 * data from (one of two API endpoints and the user's config file), and merges them into a single
 * list.
 *
 * Note that it merges extension data provided by the config file (configExtensions) only when
 * context=dev. When it does so, config file data will be merged into any available API data, giving
 * a preference to config file data.
 */
export const normalizeAndMergeExtensions = ({
  apiExtensions,
  buildDir,
  configExtensions = [],
  context,
}: MergeExtensionsOptions): ExtensionWithDev[] => {
  const apiExtensionsBySlug = new Map<string, ExtensionWithDev>(
    apiExtensions.map((extension) => [
      extension.slug,
      {
        ...extension,
        buildPlugin: extension.has_build
          ? { origin: 'remote', packageURL: new URL('/packages/buildhooks.tgz', extension.version) }
          : null,
        dev: null,
      },
    ]),
  )
  const configExtensionsBySlug = new Map<
    string,
    Omit<ExtensionWithDev, 'author' | 'extension_token' | 'version'> & {
      author: Extension['author'] | undefined
      extension_token: Extension['extension_token'] | undefined
      version: Extension['version'] | undefined
    }
  >(
    // Only use configuration-file data in development mode
    (context === 'dev' ? configExtensions : []).map((extension) => {
      let buildPluginPackageURL: URL | null = null
      if (extension.dev?.path) {
        let resolvedPath = path.isAbsolute(extension.dev.path)
          ? extension.dev.path
          : path.resolve(buildDir, extension.dev.path)
        const normalizedExtname = path.extname(resolvedPath).toLowerCase()

        // If the user has specified a path to an extension directory rather than to a tarball
        // package, interpret this as a shortcut for "the default Netlify Extension build plugin
        // artifact path, please."
        //
        // This sort of emulates SDK v1/2/3 behavior, and is an effort at making extension dev mode
        // friendlier to use. We can feel free to revisit this chocie at a later date.
        if (normalizedExtname === '') {
          resolvedPath = path.join(resolvedPath, '.ntli/site/static/packages/buildhooks.tgz')
        }

        buildPluginPackageURL = new URL(`file://${resolvedPath}`)
      }

      return [
        extension.name,
        // Normalize dev extensions to a similar shape as an API extension
        {
          author: undefined,
          dev: extension.dev,
          extension_token: undefined,
          has_build: buildPluginPackageURL !== null,
          name: extension.name,
          slug: extension.name,
          version: undefined,
          buildPlugin: buildPluginPackageURL !== null ? { origin: 'local', packageURL: buildPluginPackageURL } : null,
        },
      ]
    }),
  )

  // Merge API and configuration file metadata together by merging development metadata onto API
  // metadata.
  //
  // Explicitly allow the configuration file to reference an extension that doesn't yet exist in the
  // API so users can test their build hooks without publishing the extension first.
  const mergedExtensions = [...new Set([...apiExtensionsBySlug.keys(), ...configExtensionsBySlug.keys()])]
    .map((slug) => [apiExtensionsBySlug.get(slug), configExtensionsBySlug.get(slug)] as const)
    .map(([apiExtension, configExtension]) => {
      return {
        author: configExtension?.author ?? apiExtension?.author ?? '',
        buildPlugin: configExtension?.buildPlugin ?? apiExtension?.buildPlugin ?? null,
        dev: configExtension?.dev,
        extension_token: configExtension?.extension_token ?? apiExtension?.extension_token ?? '',
        has_build: configExtension?.has_build ?? apiExtension?.has_build ?? false,
        name: configExtension?.name ?? apiExtension?.name ?? '',
        slug: configExtension?.slug ?? apiExtension?.slug ?? '',
        version: configExtension?.version ?? apiExtension?.version ?? '',
      }
    })

  for (const extension of mergedExtensions) {
    if (extension.buildPlugin !== null) {
      const normalizedExtname = path.extname(extension.buildPlugin.packageURL.toString()).toLowerCase()
      if (normalizedExtname !== '.tgz') {
        throwUserError(
          `Extension ${extension.slug} contains unexpected build plugin URL: '${extension.buildPlugin.packageURL.toString()}'. Build plugin URLs must end in '.tgz'.`,
        )
      }
    }
  }

  return mergedExtensions
}
