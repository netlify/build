import { promisify } from 'util'

import slugify from '@sindresorhus/slugify'
import { StatsD, Tags } from 'hot-shots'

export const startClient = async function (host: string, port: number): Promise<StatsD> {
  return new StatsD({ host, port, cacheDns: true })
}

export const closeClient = async function (client: StatsD): Promise<void> {
  await promisify(client.close.bind(client))()
}

// Make sure the timer name does not include special characters.
// For example, the `packageName` of local plugins includes dots.
export const normalizeTagName = function (name: string): string {
  return slugify(name, { separator: '_' })
}

export const formatTags = function (tags: Tags): string[] {
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
