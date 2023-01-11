import { promisify } from 'util'

import slugify from '@sindresorhus/slugify'
import { StatsD } from 'hot-shots'

export interface InputStatsDOptions {
  host?: string
  port?: number
}

export type StatsDOptions = Required<InputStatsDOptions>

export const validateStatsDOptions = function (statsdOpts: InputStatsDOptions): statsdOpts is StatsDOptions {
  return !!(statsdOpts && statsdOpts.host && statsdOpts.port)
}

/**
 * Start a new StatsD Client and a new UDP socket
 */
export const startClient = async function (statsdOpts: StatsDOptions): Promise<StatsD> {
  const { host, port } = statsdOpts

  return new StatsD({
    host,
    port,
    // This caches the dns resolution for subsequent sends of metrics for this instance
    // Because we only try to send the metrics on close, this comes only into effect if `bufferFlushInterval` time is exceeded
    cacheDns: true,
    // set the maxBufferSize to infinite and the bufferFlushInterval very high, so that we only
    // send the metrics on close or if more than 10 seconds past by
    maxBufferSize: Infinity,
    bufferFlushInterval: 10_000,
  })
}

/**
 * Close the StatsD Client
 *
 * UDP packets are buffered and flushed every 10 seconds and
 * closing the client forces all buffered metrics to be flushed.
 */
export const closeClient = async function (client: StatsD): Promise<void> {
  await promisify(client.close.bind(client))()
}

/**
 * Make sure the timer name does not include special characters.
 * For example, the `packageName` of local plugins includes dots.
 */
export const normalizeTagName = function (name: string): string {
  return slugify(name, { separator: '_' })
}

/**
 * Formats and flattens the tags as array
 * We do this because we might send the same tag with different values `{ tag: ['a', 'b'] }`
 * which cannot be represented in an flattened object and `hot-shots` also supports tags as array in the format `['tag:a', 'tag:b']`
 */
export const formatTags = function (tags: Record<string, string | string[]>): string[] {
  return Object.entries(tags)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((subValue) => `${key}:${subValue}`)
      } else {
        return `${key}:${value}`
      }
    })
    .flat()
}
