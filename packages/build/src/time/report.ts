import type { Tags, StatsD } from 'hot-shots'

import {
  closeClient,
  formatTags,
  InputStatsDOptions,
  startClient,
  StatsDOptions,
  validateStatsDOptions,
} from '../report/statsd.js'

import { addAggregatedTimers } from './aggregate.js'
import { roundTimerToMillisecs } from './measure.js'

interface Timer {
  metricName: string
  stageTag: string
  parentTag: string
  durationNs: number
  tags: Record<string, string | string[]>
}

/**
 * Record the duration of a build phase, for monitoring.
 * Sends to statsd daemon.
 */
export const reportTimers = async function (
  timers: Timer[],
  statsdOpts: InputStatsDOptions,
  framework?: string,
): Promise<void> {
  if (!validateStatsDOptions(statsdOpts)) {
    return
  }

  await sendTimers(addAggregatedTimers(timers), statsdOpts, framework)
}

const sendTimers = async function (timers: Timer[], statsdOpts: StatsDOptions, framework?: string): Promise<void> {
  const client = await startClient(statsdOpts)
  timers.forEach((timer) => {
    sendTimer(timer, client, framework)
  })
  await closeClient(client)
}

const sendTimer = function (timer: Timer, client: StatsD, framework?: string): void {
  const { metricName, stageTag, parentTag, durationNs, tags } = timer
  const durationMs = roundTimerToMillisecs(durationNs)
  const statsdTags: Tags = { stage: stageTag, parent: parentTag, ...tags }

  if (framework != undefined) {
    statsdTags.framework = framework
  }

  client.distribution(metricName, durationMs, formatTags(statsdTags))
}
