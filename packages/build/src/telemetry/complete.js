const { platform, version: nodeVersion } = require('process')

const isCI = require('is-ci')
const osName = require('os-name')

const { version } = require('../../package.json')

const { telemetry } = require('./track')

// Send telemetry request when build completes
const trackBuildComplete = async function({ commandsCount, netlifyConfig, duration, siteInfo, mode }) {
  const payload = getPayload({ commandsCount, netlifyConfig, duration, siteInfo, mode })
  await telemetry.track('netlifyCI:buildComplete', payload)
}

// Retrieve telemetry information
const getPayload = function({ commandsCount, netlifyConfig, duration, siteInfo: { id: siteId }, mode }) {
  const plugins = Object.values(netlifyConfig.plugins).map(getPluginPackage)
  return {
    steps: commandsCount,
    duration,
    pluginCount: plugins.length,
    plugins,
    siteId,
    isCI,
    isNetlifyCI: mode === 'buildbot',
    buildVersion: version,
    nodeVersion: nodeVersion.replace('v', ''),
    osPlatform: OS_TYPES[platform],
    osName: osName(),
  }
}

const getPluginPackage = function({ package }) {
  return package
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
