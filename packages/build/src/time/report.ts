import type { Tags, StatsD } from 'hot-shots'

import { closeClient, formatTags, startClient } from '../report/statsd.js'

import { addAggregatedTimers } from './aggregate.js'
import { roundTimerToMillisecs } from './measure.js'

interface Timer {
  metricName: string
  stageTag: string
  parentTag: string
  durationNs: number
  tags: Record<string, string | string[]>
}

// TODO Once we have more TS coverage make host & port required and instead make `statsdOpts` below optional
// that should be more clean
export interface StatsDOptions {
  host?: string
  port?: number
}

interface TimerOptions {
  timers: Timer[]
  statsdOpts: StatsDOptions
  framework?: string
}

// Record the duration of a build phase, for monitoring.
// Sends to statsd daemon.
export const reportTimers = async function ({
  timers,
  statsdOpts: { host, port },
  framework,
}: TimerOptions): Promise<void> {
  if (host === undefined || port === undefined) {
    return
  }

  const timersA = addAggregatedTimers(timers)
  await sendTimers({ timers: timersA, statsdOpts: { host, port }, framework })
}

const sendTimers = async function ({
  timers,
  statsdOpts: { host, port },
  framework,
}: TimerOptions & { statsdOpts: Required<StatsDOptions> }): Promise<void> {
  const client = await startClient(host, port)
  timers.forEach((timer) => {
    sendTimer({ timer, client, framework })
  })
  await closeClient(client)
}

const sendTimer = function ({
  timer: { metricName, stageTag, parentTag, durationNs, tags },
  client,
  framework,
}: {
  timer: Timer
  client: StatsD
  framework?: string
}): void {
  const durationMs = roundTimerToMillisecs(durationNs)
  const statsdTags: Tags = { stage: stageTag, parent: parentTag, ...tags }

  if (framework != undefined) {
    statsdTags.framework = framework
  }

  client.distribution(metricName, durationMs, formatTags(statsdTags))
}
