import { createRequire } from 'node:module'
import { join } from 'node:path'
import { format } from 'node:util'

import * as z from 'zod'

import { getErrorMessage } from './error.js'
import { PRODUCTION_BASE_URL, fetchExtensions, getUserAgent } from './extensions_api.js'
import { log, logWarning } from './log.js'
import type { ResolvedOptions } from './options.js'
import { parseLeniently } from './validate/lenient.js'
import type { Extension, Logs } from './types.js'

const autoInstallableSchema = z.array(
  z.looseObject({
    slug: z.string(),
    hostSiteUrl: z.string(),
    /** npm packages whose presence in `dependencies` means the extension is required. */
    packages: z.array(z.string()),
  }),
)

type AutoInstallable = z.output<typeof autoInstallableSchema>[number]

/** Never throws. */
export const autoInstallExtensions = async function ({
  options,
  extensions,
  buildDir,
}: {
  options: ResolvedOptions
  extensions: Extension[]
  buildDir: string
}): Promise<Extension[]> {
  const { logs } = options
  if (!options.featureFlags['auto_install_required_extensions_v2']) {
    return extensions
  }

  const { accountId, siteId, token, offline, mode, debug } = options
  if (!accountId || !siteId || !token || offline) {
    if (debug) {
      const reason = getSkipReason(options)
      logWarning(
        logs,
        format(`Failed to auto install extension(s): ${reason}`, { accountId, siteId, buildDir, offline, mode }),
      )
    }
    return extensions
  }

  try {
    const dependencies = getDependencies(buildDir)
    if (dependencies.length === 0) {
      return extensions
    }

    const installedSlugs = new Set(extensions.map(({ slug }) => slug))
    const autoInstallable = await fetchAutoInstallable(logs)
    const required = autoInstallable.filter(
      ({ slug, packages }) => !installedSlugs.has(slug) && packages.some((name) => dependencies.includes(name)),
    )
    if (required.length === 0) {
      return extensions
    }

    const installed = await Promise.all(
      required.map((extension) => installExtension({ extension, accountId, token, mode, logs })),
    )
    return installed.includes(true) ? await fetchExtensions(options) : extensions
  } catch (error) {
    logWarning(logs, format(`Failed to auto install extension(s): ${getErrorMessage(error)}`, error))
    return extensions
  }
}

const getSkipReason = function ({ accountId, siteId, token }: ResolvedOptions): string {
  if (!accountId) return 'Missing accountId'
  if (!siteId) return 'Missing siteId'
  if (!token) return 'Missing token'
  return 'Running as offline'
}

// QUIRK: `require()` caches the file, so later resolutions in the same process see it unchanged.
const getDependencies = function (buildDir: string): string[] {
  try {
    const packageJson: unknown = createRequire(join(buildDir, 'package.json'))('./package.json')
    const { data } = z.object({ dependencies: z.record(z.string(), z.unknown()) }).safeParse(packageJson)
    return data === undefined ? [] : Object.keys(data.dependencies)
  } catch {
    return []
  }
}

// QUIRK: only `process.env` is read, so the `env`, `host` and `testOpts.host` options don't apply.
const fetchAutoInstallable = async function (logs: Logs | undefined): Promise<AutoInstallable[]> {
  try {
    const url = new URL('/meta/auto-installable', process.env['EXTENSION_API_BASE_URL'] ?? PRODUCTION_BASE_URL)
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch extensions meta')
    }
    return parseLeniently(autoInstallableSchema, await response.json(), {
      description: 'auto-installable extensions from the extension API',
      logs,
    })
  } catch (error) {
    logWarning(logs, format(`Failed to fetch auto-installable extensions meta: ${getErrorMessage(error)}`, error))
    return []
  }
}

/** `409` means the extension was already installed. */
const installExtension = async function ({
  extension: { slug, hostSiteUrl, packages },
  accountId,
  token,
  mode,
  logs,
}: {
  extension: AutoInstallable
  accountId: string
  token: string
  mode: string
  logs: Logs | undefined
}): Promise<boolean> {
  log(
    logs,
    `Installing extension "${slug}" on team "${accountId}" required by package(s): ${packages.map((name) => `"${name}"`).join(', ')}`,
  )
  const response = await fetch(new URL('/.netlify/functions/handler/on-install', hostSiteUrl), {
    method: 'POST',
    body: JSON.stringify({ teamId: accountId }),
    headers: { 'netlify-token': token, 'User-Agent': getUserAgent(mode) },
  })
  return response.ok || response.status === 409
}
