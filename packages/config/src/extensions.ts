import path from 'node:path'

import { throwUserError } from './error.js'
import type { Extension, ExtensionBuildPlugin, ExtensionWithDev } from './types/api.js'
import type { ConfigExtension } from './types/config.js'

export const NETLIFY_API_STAGING_HOSTNAME = 'api-staging.netlify.com'
export const NETLIFY_API_HOSTNAME = 'api.netlify.com'
export const EXTENSION_API_BASE_URL = 'https://api.netlifysdk.com'
export const EXTENSION_API_STAGING_BASE_URL = 'https://api-staging.netlifysdk.com'

type MergeExtensionsOptions = {
  /** Extensions installed on the site, from the extension API. */
  apiExtensions: Extension[]
  /** Extensions under development, from `netlify.toml`. Only used in the `dev` context. */
  configExtensions?: ConfigExtension[]
  /** Resolves relative `dev.path`s. */
  buildDir: string
  context: string
}

type DevExtension = Pick<ExtensionWithDev, 'buildPlugin' | 'dev' | 'has_build' | 'name' | 'slug'>

/**
 * Merge the site's extensions with those under development, which take priority, and normalize
 * both to one shape. An extension under development doesn't need to exist in the API, so build
 * hooks can be tested before the extension is published.
 */
export const normalizeAndMergeExtensions = ({
  apiExtensions,
  buildDir,
  configExtensions = [],
  context,
}: MergeExtensionsOptions): ExtensionWithDev[] => {
  const apiExtensionsBySlug = new Map(
    apiExtensions.map((extension): [string, Extension & Pick<ExtensionWithDev, 'buildPlugin' | 'dev'>] => [
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
  const devExtensionsBySlug = new Map(
    (context === 'dev' ? configExtensions : []).map((extension): [string, DevExtension] => {
      const buildPlugin = getDevBuildPlugin(extension, buildDir)
      return [
        extension.name,
        {
          dev: extension.dev,
          has_build: buildPlugin !== null,
          name: extension.name,
          slug: extension.name,
          buildPlugin,
        },
      ]
    }),
  )

  const mergedExtensions = [...new Set([...apiExtensionsBySlug.keys(), ...devExtensionsBySlug.keys()])].map(
    (slug): ExtensionWithDev => {
      const apiExtension = apiExtensionsBySlug.get(slug)
      const devExtension = devExtensionsBySlug.get(slug)
      return {
        author: apiExtension?.author ?? '',
        buildPlugin: devExtension?.buildPlugin ?? apiExtension?.buildPlugin ?? null,
        dev: devExtension?.dev,
        extension_token: apiExtension?.extension_token ?? '',
        has_build: devExtension?.has_build ?? apiExtension?.has_build ?? false,
        name: devExtension?.name ?? apiExtension?.name ?? '',
        slug: devExtension?.slug ?? apiExtension?.slug ?? '',
        version: apiExtension?.version ?? '',
      }
    },
  )

  for (const { buildPlugin, slug } of mergedExtensions) {
    if (buildPlugin !== null && path.extname(buildPlugin.packageURL.toString()).toLowerCase() !== '.tgz') {
      throwUserError(
        `Extension ${slug} contains unexpected build plugin URL: '${buildPlugin.packageURL.toString()}'. Build plugin URLs must end in '.tgz'.`,
      )
    }
  }

  return mergedExtensions
}

/**
 * The build plugin of an extension under development, from its `dev.path`. A directory stands for
 * the build plugin tarball the extension SDK outputs in it, which emulates SDK v1 to v3.
 */
const getDevBuildPlugin = function ({ dev }: ConfigExtension, buildDir: string): ExtensionBuildPlugin | null {
  if (!dev?.path) {
    return null
  }

  const resolvedPath = path.isAbsolute(dev.path) ? dev.path : path.resolve(buildDir, dev.path)
  const packagePath =
    path.extname(resolvedPath) === ''
      ? path.join(resolvedPath, '.ntli/site/static/packages/buildhooks.tgz')
      : resolvedPath
  return { origin: 'local', packageURL: new URL(`file://${packagePath}`) }
}
