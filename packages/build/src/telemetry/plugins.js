const os = require('os')

const isCI = require('is-ci')
const osName = require('os-name')

const pkg = require('../../package.json')
const isNetlifyCI = require('../utils/is-netlify-ci')

const sendData = require('./api')

const { BUILD_TELEMETRY_DISABLED } = process.env
const OS_PLATFORM = osType(os.platform())
const OS_NAME = osName()

/* automatically prefix event names */
const prefixEventNames = {
  NAMESPACE: 'prefixer',
  trackStart: ({ payload, instance }) => {
    const { event } = payload
    const prefix = `${instance.getState('context.app')}:`
    const prefixedEvent = event.startsWith(prefix) ? event : `${prefix}${event}`
    return {
      ...payload,
      event: prefixedEvent,
    }
  },
}

/* enrich telemetry payload */
const enrichPayload = {
  NAMESPACE: 'enrich',
  trackStart: ({ payload }) => {
    return {
      ...payload,
      properties: {
        ...payload.properties,
        // check if running in CI environment
        isCI: isCI,
        // Check if Netlify CI
        isNetlifyCI: isNetlifyCI(),
        // Add package version
        buildVersion: pkg.version,
        // Add node version
        nodeVersion: process.version.replace(/^v/, ''),
        // OS platform. Linix, windows, MacOS
        osPlatform: OS_PLATFORM,
        // OS name
        osName: OS_NAME,
      },
    }
  },
}

/* Sent data to telemetry service, if telemetry enabled */
const netlifyTelemetry = {
  NAMESPACE: 'netlify-telemetry',
  track: ({ payload, instance }) => {
    if (instance.getState('context.debug')) {
      console.log(`send`, payload)
      return
    }
    sendData(payload, pkg.version)
  },
}

function osType(platform) {
  if (platform == 'darwin') {
    return 'MacOS'
  } else if (platform == 'win32' || platform == 'win64') {
    return 'Windows'
  }
  return 'Linux'
}

/* If BUILD_TELEMETRY_DISABLED, disable api calls */
const activePlugins = BUILD_TELEMETRY_DISABLED ? [] : [prefixEventNames, enrichPayload, netlifyTelemetry]
/* Return analytic plugins */
module.exports = activePlugins
