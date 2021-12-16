import { pluginsUrl, pluginsList as oldPluginsList } from '@netlify/plugins-list'
import got from 'got'
import isPlainObj from 'is-plain-obj'

import { logPluginsList, logPluginsFetchError } from '../log/messages/plugins.js'

import { CONDITIONS } from './compatibility.js'

// Retrieve the list of plugins officially vetted by us and displayed in our
// plugins directory UI.
// We fetch this list during each build (no caching) because we want new
// versions of plugins to be available instantly to all users. The time to
// make this request is somewhat ok (in the 100ms range).
// We only fetch this plugins list when needed, i.e. we defer it as much as
// possible.
export const getPluginsList = async function ({ debug, logs, testOpts: { pluginsListUrl } }) {
  // We try not to mock in integration tests. However, sending a request for
  // each test would be too slow and make tests unreliable.
  if (pluginsListUrl === 'test') {
    return []
  }

  const pluginsListUrlA = pluginsListUrl === undefined ? pluginsUrl : pluginsListUrl
  const pluginsList = await fetchPluginsList({ logs, pluginsListUrl: pluginsListUrlA })
  const pluginsListA = normalizePluginsList(pluginsList)
  logPluginsList({ pluginsList: pluginsListA, debug, logs })
  return pluginsListA
}

const fetchPluginsList = async function ({ logs, pluginsListUrl }) {
  try {
    const { body } = await got(pluginsListUrl, { responseType: 'json', timeout: PLUGINS_LIST_TIMEOUT })

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
    return oldPluginsList
  }
}

// 1 minute HTTP request timeout
const PLUGINS_LIST_TIMEOUT = 6e4

const isValidPluginsList = function (pluginsList) {
  return Array.isArray(pluginsList) && pluginsList.every(isPlainObj)
}

const normalizePluginsList = function (pluginsList) {
  return Object.fromEntries(pluginsList.map(normalizePluginItem))
}

// `version` in `plugins.json` is the latest version.
// A `compatibility` array of objects can be added to specify conditions to
// apply different versions.
// `netlify/plugins` ensures that `compatibility`:
//  - Has the proper shape.
//  - Is sorted from the highest to lowest version.
//  - Does not include the latest `version`.
const normalizePluginItem = function ({ package: packageName, version, compatibility = [] }) {
  const versions = compatibility.length === 0 ? [{ version }] : compatibility
  const versionsA = versions.map(normalizeCompatVersion)
  return [packageName, versionsA]
}

const normalizeCompatVersion = function ({ version, migrationGuide, featureFlag, ...otherProperties }) {
  const conditions = Object.entries(otherProperties).filter(isCondition).map(normalizeCondition)
  return { version, migrationGuide, featureFlag, conditions }
}

const isCondition = function ([type]) {
  return type in CONDITIONS
}

const normalizeCondition = function ([type, condition]) {
  return { type, condition }
}
