import { pluginsUrl, pluginsList as oldPluginsList } from '@netlify/plugins-list'
import isPlainObj from 'is-plain-obj'

import { BufferedLogs } from '../log/logger.js'
import { logPluginsList, logPluginsFetchError } from '../log/messages/plugins.js'

import { CONDITIONS } from './plugin_conditions.js'

/**
 * Internal type from the `plugins.json`
 * @private
 */
type PluginCompatiblityEntry = {
  version: string
  featureFlag?: string
  overridePinnedVersion?: string
  migrationGuide?: string
  siteDependencies?: Record<string, string>
}

/**
 * Internal type from the `plugins.json`
 * @private
 */
type PluginListEntry = {
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
  migrationGuide?: string
  featureFlag?: string
  overridePinnedVersion?: string
  conditions: {
    type: keyof typeof CONDITIONS
    condition: string | Record<string, string>
  }[]
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
  testOpts: { pluginsListUrl } = {},
}: {
  testOpts?: { pluginsListUrl?: string }
  debug?: boolean
  logs?: BufferedLogs
}): Promise<PluginList> {
  // We try not to mock in integration tests. However, sending a request for
  // each test would be too slow and make tests unreliable.
  if (pluginsListUrl === 'test') {
    return {}
  }

  const pluginsListUrlA = pluginsListUrl === undefined ? pluginsUrl : pluginsListUrl
  const pluginsList = await fetchPluginsList({ logs, pluginsListUrl: pluginsListUrlA })
  const pluginsListA = normalizePluginsList(pluginsList)
  logPluginsList({ pluginsList: pluginsListA, debug, logs })
  return pluginsListA
}

const fetchPluginsList = async function ({
  logs,
  pluginsListUrl,
}: {
  logs?: BufferedLogs
  pluginsListUrl: string
}): Promise<PluginListEntry[]> {
  try {
    const response = await fetch(pluginsListUrl, { signal: AbortSignal.timeout(PLUGINS_LIST_TIMEOUT) })

    if (!response.ok) {
      throw new Error(`Request failed with a response code: ${response.status.toString()}`)
    }

    const body = await response.json()

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
    logPluginsFetchError(logs, error.message)
    return oldPluginsList as PluginListEntry[]
  }
}

const isValidPluginsList = function (pluginsList): pluginsList is PluginListEntry[] {
  return Array.isArray(pluginsList) && pluginsList.every(isPlainObj)
}

const normalizePluginsList = function (pluginsList: PluginListEntry[]) {
  return Object.fromEntries<ReturnType<typeof normalizePluginItem>[1]>(
    pluginsList.map(normalizePluginItem),
  ) as PluginList
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
}: PluginCompatiblityEntry) {
  const conditions = Object.entries(otherProperties).filter(isCondition).map(normalizeCondition)
  return { version, migrationGuide, overridePinnedVersion, featureFlag, conditions }
}

const isCondition = function ([type]: [string, ...unknown[]]) {
  return type in CONDITIONS
}

const normalizeCondition = function ([type, condition]: [string, string | Record<string, string>]) {
  return { type, condition }
}
