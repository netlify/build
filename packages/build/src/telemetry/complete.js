'use strict'

const { platform, version: nodeVersion } = require('process')

const osName = require('os-name')
const { v4: uuidv4 } = require('uuid')

const { version } = require('../../package.json')
const { roundTimerToMillisecs } = require('../time/measure')

const { track } = require('./track')

// Send telemetry request when build completes
const trackBuildComplete = async function ({
  status,
  commandsCount,
  netlifyConfig,
  durationNs,
  siteInfo,
  telemetry,
  testOpts,
}) {
  if (!telemetry) {
    return
  }

  const payload = getPayload({ status, commandsCount, netlifyConfig, durationNs, siteInfo })
  await track({ payload, testOpts })
}

// Retrieve telemetry information
const getPayload = function ({ status, commandsCount, netlifyConfig, durationNs, siteInfo }) {
  const basePayload = {
    event: 'build:ci_build_process_completed',
    timestamp: Date.now(),
    properties: {
      status,
      steps: commandsCount,
      buildVersion: version,
      nodeVersion: nodeVersion.replace('v', ''),
      osPlatform: OS_TYPES[platform],
      osName: osName(),
    },
  }

  return addDuration(addConfigData(addSiteInfoData(basePayload, siteInfo), netlifyConfig), durationNs)
}

const addSiteInfoData = function (payload, siteInfo = {}) {
  const userData = siteInfo.user_id ? { userId: siteInfo.user_id } : { anonymousId: uuidv4() }
  const properties = { properties: { ...payload.properties, siteId: siteInfo.id } }
  return { ...userData, ...payload, ...properties }
}

const addConfigData = function (payload, netlifyConfig = {}) {
  if (netlifyConfig.plugins === undefined) return payload

  // Only extract package name and its origin
  const plugins = Object.values(netlifyConfig.plugins).map(({ package: packageName, origin }) => ({
    name: packageName,
    origin,
  }))
  const properties = { properties: { ...payload.properties, plugins, pluginsCount: plugins.length } }
  return { ...payload, ...properties }
}

const addDuration = function (payload, durationNs) {
  if (typeof durationNs !== 'number') return payload

  const durationMs = roundTimerToMillisecs(durationNs)
  return { ...payload, ...{ properties: { ...payload.properties, duration: durationMs } } }
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
