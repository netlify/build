'use strict'

const { platform } = require('process')

const got = require('got')
const osName = require('os-name')

const { version: buildVersion } = require('../../package.json')
const { addErrorInfo } = require('../error/info')
const { roundTimerToMillisecs } = require('../time/measure')

const DEFAULT_TELEMETRY_TIMEOUT = 1200
const DEFAULT_TELEMETRY_CONFIG = {
  origin: 'https://api.segment.io/v1',
  writeKey: 'dWhlM1lYSlpNd1k5Uk9rcjFra2JSOEoybnRjZjl0YTI6',
  timeout: DEFAULT_TELEMETRY_TIMEOUT,
}

// Send telemetry request when build completes
const trackBuildComplete = async function ({
  status,
  commandsCount,
  pluginsOptions,
  durationNs,
  siteInfo,
  telemetry,
  userNodeVersion,
  testOpts: { telemetryOrigin = DEFAULT_TELEMETRY_CONFIG.origin, telemetryTimeout = DEFAULT_TELEMETRY_CONFIG.timeout },
}) {
  if (!telemetry) {
    return
  }

  try {
    const payload = getPayload({ status, commandsCount, pluginsOptions, durationNs, siteInfo, userNodeVersion })
    await track({
      payload,
      config: { ...DEFAULT_TELEMETRY_CONFIG, origin: telemetryOrigin, timeout: telemetryTimeout },
    })
  } catch (error) {
    addErrorInfo(error, { type: 'telemetry' })
    throw error
  }
}

// Send track HTTP request to telemetry.
const track = async function ({ payload, config: { origin, writeKey, timeout } }) {
  const url = `${origin}/track`
  await got.post(url, {
    json: true,
    body: payload,
    timeout,
    retry: 0,
    headers: { Authorization: `Basic ${writeKey}` },
  })
}

// Retrieve telemetry information
// siteInfo can be empty if the build fails during the get config step
const getPayload = function ({ status, commandsCount, pluginsOptions, durationNs, userNodeVersion, siteInfo = {} }) {
  return {
    userId: 'buildbot_user',
    event: 'build:ci_build_process_completed',
    timestamp: Date.now(),
    properties: {
      status,
      steps: commandsCount,
      buildVersion,
      // We're passing the node version set by the buildbot/user which will run the `build.command` and
      // the `package.json`/locally defined plugins
      nodeVersion: userNodeVersion,
      osPlatform: OS_TYPES[platform],
      osName: osName(),
      siteId: siteInfo.id,
      ...(pluginsOptions !== undefined && {
        plugins: pluginsOptions.map(getPlugin),
        pluginCount: pluginsOptions.length,
      }),
      ...(durationNs !== undefined && { duration: roundTimerToMillisecs(durationNs) }),
    },
  }
}

const OS_TYPES = {
  linux: 'Linux',
  darwin: 'MacOS',
  win32: 'Windows',
  android: 'Android',
  sunos: 'SunOS',
  aix: 'AIX',
  freebsd: 'FreeBSD',
  openbsd: 'OpenBSD',
}

const getPlugin = function ({
  packageName,
  origin,
  loadedFrom,
  nodeVersion,
  pinnedVersion,
  pluginPackageJson: { version } = {},
}) {
  return { name: packageName, origin, loadedFrom, nodeVersion, pinnedVersion, version }
}

module.exports = { trackBuildComplete }
