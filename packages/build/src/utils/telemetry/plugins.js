const pkg = require('../../../package.json')
const isNetlifyCI = require('../is-netlify-ci')

const sendData = require('./api')

/* automatically prefix event names */
const prefixEventNames = {
  NAMESPACE: 'prefixer',
  trackStart: ({ payload, instance }) => {
    const { event } = payload
    const prefix = `${instance.getState('context.app')}:`
    const prefixedEvent = event.startsWith(prefix) ? event : `${prefix}${event}`
    return {
      ...payload,
      event: prefixedEvent
    }
  }
}

/* enrich telemetry payload */
const enrichPayload = {
  NAMESPACE: 'enrich',
  trackStart: ({ payload, instance }) => {
    return {
      ...payload,
      properties: { ...payload.properties, isNetlifyCI: isNetlifyCI() }
    }
  }
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
  }
}

/* Return analytic plugins */
module.exports = [prefixEventNames, enrichPayload, netlifyTelemetry]
