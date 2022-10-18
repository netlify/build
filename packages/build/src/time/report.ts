import { closeClient, startClient } from '../report/statsd.js'

import { addAggregatedTimers } from './aggregate.js'
import { roundTimerToMillisecs } from './measure.js'

// Record the duration of a build phase, for monitoring.
// Sends to statsd daemon.
export const reportTimers = async function ({ timers, statsdOpts: { host, port }, framework }) {
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

const sendTimer = function ({ timer: { metricName, stageTag, parentTag, durationNs, tags }, client, framework }) {
  const durationMs = roundTimerToMillisecs(durationNs)
  const frameworkTag = framework === undefined ? {} : { framework }
  client.distribution(metricName, durationMs, { stage: stageTag, parent: parentTag, ...tags, ...frameworkTag })
}
