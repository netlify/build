'use strict'

const { platform, version: nodeVersion } = require('process')

const got = require('got')
const osName = require('os-name')

const { version } = require('../../package.json')
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
  netlifyConfig,
  durationNs,
  siteInfo,
  telemetry,
  testOpts: { telemetryOrigin = DEFAULT_TELEMETRY_CONFIG.origin, telemetryTimeout = DEFAULT_TELEMETRY_CONFIG.timeout },
}) {
  if (!telemetry) {
    return
  }

  try {
    const payload = getPayload({ status, commandsCount, netlifyConfig, durationNs, siteInfo })
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
const getPayload = function ({ status, commandsCount, netlifyConfig, durationNs, siteInfo = {} }) {
  const basePayload = {
    userId: 'buildbot_user',
    event: 'build:ci_build_process_completed',
    timestamp: Date.now(),
    properties: {
      status,
      steps: commandsCount,
      buildVersion: version,
      nodeVersion: nodeVersion.replace('v', ''),
      osPlatform: OS_TYPES[platform],
      osName: osName(),
      siteId: siteInfo.id,
    },
  }

  return addDuration(addConfigData(basePayload, netlifyConfig), durationNs)
}

const addConfigData = function (payload, netlifyConfig = {}) {
  if (netlifyConfig.plugins === undefined) return payload

  // Only extract package name and its origin
  const plugins = Object.values(netlifyConfig.plugins).map(({ package: packageName, origin }) => ({
    name: packageName,
    origin,
  }))
  const properties = { properties: { ...payload.properties, plugins, pluginCount: plugins.length } }
  return { ...payload, ...properties }
}

const addDuration = function (payload, durationNs) {
  if (typeof durationNs !== 'number') return payload

  const durationMs = roundTimerToMillisecs(durationNs)
  return { ...payload, properties: { ...payload.properties, duration: durationMs } }
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

module.exports = { trackBuildComplete }
