'use strict'

const oldPluginsList = require('@netlify/plugins-list')
// TODO: replace with `Object.fromEntries()` after dropping Node <12.0.0
const fromEntries = require('@ungap/from-entries')
const got = require('got')

const { logPluginsList } = require('../log/messages/plugins')
const { logPluginsFetchError } = require('../log/messages/plugins')

// Retrieve the list of plugins officially vetted by us and displayed in our
// plugins directory UI.
// We fetch this list during each build (no caching) because we want new
// versions of plugins to be available instantly to all users. The time to
// make this request is somewhat ok (in the 100ms range).
// We only fetch this plugins list when needed, i.e. we defer it as much as
// possible.
const getPluginsList = async function ({ debug, logs, testOpts: { pluginsListUrl = PLUGINS_LIST_URL } }) {
  // We try not to mock in integration tests. However, sending a request for
  // each test would be too slow and make tests unreliable.
  if (pluginsListUrl === 'test') {
    return []
  }

  const pluginsList = await fetchPluginsList({ logs, pluginsListUrl })
  const pluginsListA = normalizePluginsList(pluginsList)
  logPluginsList({ pluginsList: pluginsListA, debug, logs })
  return pluginsListA
}

const fetchPluginsList = async function ({ logs, pluginsListUrl }) {
  try {
    const { body } = await got(pluginsListUrl, { json: true, timeout: PLUGINS_LIST_TIMEOUT })
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

const PLUGINS_LIST_URL = 'https://netlify-plugins.netlify.app/plugins.json'
// 1 minute HTTP request timeout
const PLUGINS_LIST_TIMEOUT = 6e4

const normalizePluginsList = function (pluginsList) {
  return fromEntries(pluginsList.map(normalizePluginItem))
}

const normalizePluginItem = function ({ package: packageName, version }) {
  return [packageName, version]
}

module.exports = { getPluginsList }
