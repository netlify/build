const isCI = require('is-ci')

const pkg = require('../../../package.json')
const isNetlifyCI = require('../is-netlify-ci')

const sendData = require('./api')

const { BUILD_TELEMETRY_DISABLED } = process.env

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
  trackStart: ({ payload, instance }) => {
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

/* If BUILD_TELEMETRY_DISABLED, disable api calls */
const activePlugins = BUILD_TELEMETRY_DISABLED ? [] : [prefixEventNames, enrichPayload, netlifyTelemetry]
/* Return analytic plugins */
module.exports = activePlugins
