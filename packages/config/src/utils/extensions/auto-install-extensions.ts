import { createRequire } from 'module'
import { join } from 'path'
import { hrtime } from 'process'

import { trace } from '@opentelemetry/api'

import { type Extension, getExtensions } from '../../api/site_info.js'
import { log, logWarning } from '../../log/logger.js'
import { type ModeOption } from '../../types/options.js'

import { fetchAutoInstallableExtensionsMeta, installExtension } from './utils.js'

const tracer = trace.getTracer('config')

function getPackageJSON(directory: string) {
  try {
    const require = createRequire(join(directory, 'package.json'))
    return require('./package.json')
  } catch {
    // Gracefully fail if no package.json found in buildDir
    return {}
  }
}

interface AutoInstallOptions {
  featureFlags: any
  siteId: string
  accountId: string
  token: string
  buildDir: string
  extensions: Extension[]
  offline: boolean
  testOpts: any
  mode: ModeOption
  extensionApiBaseUrl: string
  debug?: boolean
  logs?: any
}

export async function handleAutoInstallExtensions({
  featureFlags,
  siteId,
  accountId,
  token,
  buildDir,
  extensions,
  offline,
  testOpts = {},
  mode,
  extensionApiBaseUrl,
  debug = false,
  logs,
}: AutoInstallOptions) {
  if (!featureFlags?.auto_install_required_extensions_v2) {
    return extensions
  }
  if (!accountId || !siteId || !token || !buildDir || offline) {
    const reason = !accountId
      ? 'Missing accountId'
      : !siteId
        ? 'Missing siteId'
        : !token
          ? 'Missing token'
          : !buildDir
            ? 'Missing buildDir'
            : 'Running as offline'

    if (debug) {
      logWarning(logs, `Failed to auto install extension(s): ${reason}`)
    }
    return extensions
  }

  const startedAt = hrtime.bigint()
  return tracer.startActiveSpan('auto-install-extensions', async (span) => {
    try {
      const packageJson = getPackageJSON(buildDir)
      if (
        !packageJson?.dependencies ||
        typeof packageJson?.dependencies !== 'object' ||
        Object.keys(packageJson?.dependencies)?.length === 0
      ) {
        return extensions
      }

      const autoInstallableExtensions = await fetchAutoInstallableExtensionsMeta()
      const enabledExtensionSlugs = new Set((extensions ?? []).map(({ slug }) => slug))
      const extensionsToInstallCandidates = autoInstallableExtensions.filter(
        ({ slug }) => !enabledExtensionSlugs.has(slug),
      )
      const extensionsToInstall = extensionsToInstallCandidates.filter(({ packages }) => {
        for (const pkg of packages) {
          if (packageJson?.dependencies && Object.hasOwn(packageJson.dependencies, pkg)) {
            return true
          }
        }
        return false
      })

      if (extensionsToInstall.length === 0) {
        return extensions
      }

      const results = await Promise.all(
        extensionsToInstall.map(async (ext) => {
          log(
            logs,
            `Installing extension "${ext.slug}" on team "${accountId}" required by package(s): "${ext.packages.join(
              '",',
            )}"`,
          )
          return installExtension({
            accountId,
            netlifyToken: token,
            slug: ext.slug,
            hostSiteUrl: ext.hostSiteUrl,
            extensionInstallationSource: mode,
          })
        }),
      )
      span.setAttribute('extensions.installed_count', results.filter((result) => !result.error).length)

      if (results.length > 0 && results.some((result) => !result.error)) {
        return getExtensions({
          siteId,
          accountId,
          testOpts,
          offline,
          token,
          featureFlags,
          extensionApiBaseUrl,
          mode,
        })
      }
      return extensions
    } catch (error) {
      span.recordException(error)
      logWarning(logs, `Failed to auto install extension(s): ${error.message}`)
      return extensions
    } finally {
      const durationMs = Number(hrtime.bigint() - startedAt) / 1e6
      span.setAttribute('duration_ms', durationMs)
      span.end()
    }
  })
}
