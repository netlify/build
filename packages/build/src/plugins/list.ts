import { pluginsUrl, pluginsList as oldPluginsList } from '@netlify/plugins-list'
import { isPlainObject } from '../utils/is_plain_object.js'

import type { Logs } from '../log/logger.js'
import { logPluginsList, logPluginsFetchError } from '../log/messages/plugins.js'

import { CONDITIONS, type PluginCondition } from './plugin_conditions.js'

/**
 * Internal type from the `plugins.json`
 */
export type PluginCompatiblityEntry = {
  version: string
  featureFlag?: string
  overridePinnedVersion?: string
  migrationGuide?: string
  nodeVersion?: string
  siteDependencies?: Record<string, string>
}

/**
 * Internal type from the `plugins.json`
 */
export type PluginListEntry = {
  author: string
  description: string
  name: string
  package: string
  repo: string
  version: string
  compatibility: PluginCompatiblityEntry[]
}

/**
 * The resolved and normalized Plugin list
 */

export type PluginList = Record<string, PluginVersion[]>
export type PluginVersion = {
  version: string
  migrationGuide?: string | undefined
  featureFlag?: string | undefined
  overridePinnedVersion?: string | undefined
  conditions: PluginCondition[]
}

/** 1 minute HTTP request timeout */
const PLUGINS_LIST_TIMEOUT = 6e4

/**
 * Retrieve the list of plugins officially vetted by us and displayed in our
 * plugins directory UI.
 * We fetch this list during each build (no caching) because we want new
 * versions of plugins to be available instantly to all users. The time to
 * make this request is somewhat ok (in the 100ms range).
 * We only fetch this plugins list when needed, i.e. we defer it as much as
 * possible.
 */
export const getPluginsList = async function ({
  debug,
  logs,
  // A default, unlike `??`, keeps a `null` URL as before
  testOpts: { pluginsListUrl = pluginsUrl } = {},
}: {
  testOpts?: { pluginsListUrl?: string | undefined }
  debug?: boolean | undefined
  logs?: Logs | undefined
}): Promise<PluginList> {
  // We try not to mock in integration tests. However, sending a request for
  // each test would be too slow and make tests unreliable.
  if (pluginsListUrl === 'test') {
    return {}
  }

  const pluginsList = await fetchPluginsList({ logs, pluginsListUrl })
  const pluginsListA = normalizePluginsList(pluginsList)
  logPluginsList({ pluginsList: pluginsListA, debug, logs })
  return pluginsListA
}

const fetchPluginsList = async function ({
  logs,
  pluginsListUrl,
}: {
  logs: Logs | undefined
  pluginsListUrl: string
}): Promise<PluginListEntry[]> {
  try {
    const response = await fetch(pluginsListUrl, { signal: AbortSignal.timeout(PLUGINS_LIST_TIMEOUT) })

    if (!response.ok) {
      throw new Error(`Request failed with a response code: ${response.status.toString()}`)
    }

    const body: unknown = await response.json()

    if (!isValidPluginsList(body)) {
      throw new Error(`Request succeeded but with an invalid response:\n${JSON.stringify(body, null, 2)}`)
    }

    return body
    // The Netlify Site should be up. This is a fallback.
    // `oldPluginsList` might not contain the latest plugins versions:
    //  - We should do `npm publish` as soon as a PR is merged in
    //    `netlify/plugins` but it is possible we don't.
    //  - Releasing it requires a @netlify/buld release, which requires itself a
    //    buildbot release.
  } catch (error) {
    // `fetch()`, `AbortSignal.timeout()`, `response.json()` and the `throw`s above only throw `Error` instances
    logPluginsFetchError(logs, error instanceof Error ? error.message : String(error))
    return oldPluginsList
  }
}

const isValidPluginsList = function (pluginsList: unknown): pluginsList is PluginListEntry[] {
  return Array.isArray(pluginsList) && pluginsList.every(isPlainObject)
}

const normalizePluginsList = function (pluginsList: PluginListEntry[]): PluginList {
  return Object.fromEntries(pluginsList.map(normalizePluginItem))
}

// When `compatability` array is present it takes precedence, otherwise top-level `version` field is used as latest version
// Plugin data comes from @netlify/plugins
const normalizePluginItem = function ({ package: packageName, version, compatibility = [] }: PluginListEntry) {
  const versions = compatibility.length === 0 ? [{ version }] : compatibility
  const versionsA = versions.map(normalizeCompatVersion)
  return [packageName, versionsA] as const
}

const normalizeCompatVersion = function ({
  version,
  migrationGuide,
  featureFlag,
  overridePinnedVersion,
  ...otherProperties
}: PluginCompatiblityEntry): PluginVersion {
  const conditions = Object.entries(otherProperties).filter(isCondition).map(normalizeCondition)
  return { version, migrationGuide, overridePinnedVersion, featureFlag, conditions }
}

const isCondition = function ([type]: [string, ...unknown[]]) {
  return type in CONDITIONS
}

const normalizeCondition = function ([type, condition]: [string, string | Record<string, string>]): PluginCondition {
  // `isCondition()` only keeps `CONDITIONS` keys, whose `plugins.json` values `PluginCompatiblityEntry` describes
  return { type, condition } as PluginCondition
}
