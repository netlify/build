import path from 'node:path'

import { type Extension } from './api/site_info.js'
import { throwUserError } from './error.js'

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
 * mergeExtensions accepts several lists of extensions configured for the current build target and
 * stitches them together into a single list. It performs filtration depending on the current build
 * context and merges development-time information set via the configuration file (netlify.toml)
 * with canonical information retrieved from the Netlify API.
 */
export const mergeExtensions = ({
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
        if (path.isAbsolute(extension.dev.path)) {
          buildPluginPackageURL = new URL(`file://${extension.dev.path}`)
        } else {
          buildPluginPackageURL = new URL(`file://${path.resolve(buildDir, extension.dev.path)}`)
        }
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
    if (extension.buildPlugin !== null && !extension.buildPlugin.packageURL.toString().toLowerCase().endsWith('.tgz')) {
      return throwUserError(
        `Extension ${extension.slug} contains unexpected build plugin URL: '${extension.buildPlugin.packageURL.toString()}'. Build plugin URLs must end in '.tgz'.`,
      )
    }
  }

  return mergedExtensions
}
