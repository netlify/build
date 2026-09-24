import path from 'node:path'

import { autoInstallExtensions } from './auto_install.js'
import { throwUserError } from './error.js'
import type { ResolvedOptions } from './options.js'
import type { ConfigExtension, Extension, ExtensionBuildPlugin, Integration, NetlifyConfig } from './types.js'

export { fetchExtensions } from './extensions_api.js'

export const getIntegrations = async function ({
  options,
  extensions,
  config,
  buildDir,
}: {
  options: ResolvedOptions
  extensions: Extension[]
  config: NetlifyConfig
  buildDir: string
}): Promise<Integration[]> {
  const installedExtensions = await autoInstallExtensions({ options, extensions, buildDir })
  const devExtensions = options.context === 'dev' ? (config.integrations ?? []) : []
  const integrations = mergeExtensions(installedExtensions, devExtensions, buildDir)
  integrations.forEach(checkBuildPluginUrl)
  return integrations
}

/**
 * Extensions under development take priority over installed ones with the same slug. They don't
 * need to be installed, so build hooks can be tried before the extension is published.
 */
const mergeExtensions = function (
  installedExtensions: Extension[],
  devExtensions: ConfigExtension[],
  buildDir: string,
): Integration[] {
  const installedBySlug = new Map(
    installedExtensions.map((extension) => [
      extension.slug,
      { extension, buildPlugin: getInstalledBuildPlugin(extension) },
    ]),
  )
  const devBySlug = new Map(
    devExtensions.map((extension) => [
      extension.name,
      { extension, buildPlugin: getDevBuildPlugin(extension, buildDir) },
    ]),
  )
  const slugs = new Set([...installedBySlug.keys(), ...devBySlug.keys()])

  return [...slugs].map((slug): Integration => {
    const installed = installedBySlug.get(slug)
    const dev = devBySlug.get(slug)
    return {
      author: installed?.extension.author ?? '',
      // QUIRK: a dev extension without `dev.path` keeps the installed one's build plugin, but not its `has_build`.
      buildPlugin: dev?.buildPlugin ?? installed?.buildPlugin ?? null,
      dev: dev?.extension.dev,
      extension_token: installed?.extension.extension_token ?? '',
      has_build: dev === undefined ? (installed?.extension.has_build ?? false) : dev.buildPlugin !== null,
      name: dev?.extension.name ?? installed?.extension.name ?? '',
      slug: dev?.extension.name ?? installed?.extension.slug ?? '',
      version: installed?.extension.version ?? '',
    }
  })
}

// Only the origin of `version` is used. A `version` that isn't a URL throws a TypeError, which has always been so.
const getInstalledBuildPlugin = ({ has_build: hasBuild, version }: Extension): ExtensionBuildPlugin | null =>
  hasBuild ? { origin: 'remote', packageURL: new URL('/packages/buildhooks.tgz', version) } : null

/** A `dev.path` without an extension is a directory holding the tarball the extension SDK outputs. */
const getDevBuildPlugin = function ({ dev }: ConfigExtension, buildDir: string): ExtensionBuildPlugin | null {
  if (!dev?.path) {
    return null
  }

  // Not `path.resolve()` alone: absolute paths are kept exactly as written.
  const resolvedPath = path.isAbsolute(dev.path) ? dev.path : path.resolve(buildDir, dev.path)
  const packagePath =
    path.extname(resolvedPath) === ''
      ? path.join(resolvedPath, '.ntli/site/static/packages/buildhooks.tgz')
      : resolvedPath
  // QUIRK: concatenated rather than `pathToFileURL()`, so `#` and `?` in the path start a fragment or query.
  return { origin: 'local', packageURL: new URL(`file://${packagePath}`) }
}

const checkBuildPluginUrl = function ({ buildPlugin, slug }: Integration) {
  if (buildPlugin !== null && path.extname(buildPlugin.packageURL.toString()).toLowerCase() !== '.tgz') {
    throwUserError(
      `Extension ${slug} contains unexpected build plugin URL: '${buildPlugin.packageURL.toString()}'. Build plugin URLs must end in '.tgz'.`,
    )
  }
}
