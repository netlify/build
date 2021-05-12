'use strict'

const { promisify } = require('util')

const StatsdClient = require('statsd-client')

const { addAggregatedTimers } = require('./aggregate')
const { roundTimerToMillisecs } = require('./measure')

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// Record the duration of a build phase, for monitoring.
// Sends to statsd daemon.
const reportTimers = async function ({ timers, statsdOpts: { host, port }, framework }) {
  if (host === undefined) {
    return
  }

  const timersA = addAggregatedTimers(timers)
  await sendTimers({ timers: timersA, host, port, framework })
}

const sendTimers = async function ({ timers, host, port, framework }) {
  const client = await startClient(host, port)
  timers.forEach((timer) => {
    sendTimer({ timer, client, framework })
  })
  await closeClient(client)
}

// The socket creation is delayed until the first packet is sent. In our
// case, this happens just before `client.close()` is called, which is too
// late and make it not send anything. We need to manually create it using
// the internal API.
const startClient = async function (host, port) {
  const client = new StatsdClient({ host, port, socketTimeout: 0 })
  // eslint-disable-next-line no-underscore-dangle
  await promisify(client._socket._createSocket.bind(client._socket))()
  return client
}

const sendTimer = function ({ timer: { metricName, stageTag, parentTag, durationNs, tags }, client, framework }) {
  const durationMs = roundTimerToMillisecs(durationNs)
  const frameworkTag = framework === undefined ? {} : { framework }
  client.timing(metricName, durationMs, { stage: stageTag, parent: parentTag, ...tags, ...frameworkTag })
}

// UDP packets are buffered and flushed at regular intervals by statsd-client.
// Closing force flushing all of them.
const closeClient = async function (client) {
  client.close()

  // statsd-clent does not provide with a way of knowing when the socket is done
  // closing, so we need to use the following hack.
  await pSetTimeout(CLOSE_TIMEOUT)
  await pSetTimeout(CLOSE_TIMEOUT)
}

// See https://github.com/msiebuhr/node-statsd-client/blob/45a93ee4c94ca72f244a40b06cb542d4bd7c3766/lib/EphemeralSocket.js#L81
const CLOSE_TIMEOUT = 11

module.exports = { reportTimers }
