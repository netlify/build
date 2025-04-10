import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { join } from 'path'

import { BufferedResponse, getBufferedResponse } from './buffered_response.js'
import { HeadersObject } from './headers.js'

const DEFAULT_TTL = 30_000
const DEFAULT_SWR = 120_000

interface APIOptions {
  fsPath?: string
  ttl?: number
  swr?: number
}

export class APICache {
  entries: Record<string, BufferedResponse>
  fetches: Record<string, Promise<BufferedResponse | null>>
  fsPath?: string
  fsPathSetup?: Promise<string | void>
  ttl: number
  swr: number

  constructor({ fsPath, ttl = DEFAULT_TTL, swr = DEFAULT_SWR }: APIOptions) {
    this.entries = {}
    this.fetches = {}
    this.fsPath = fsPath
    this.fsPathSetup = fsPath ? fs.mkdir(fsPath, { recursive: true }) : Promise.resolve()
    this.ttl = ttl
    this.swr = swr
  }

  private async addToCache(key: string, res: BufferedResponse) {
    this.entries[key] = res

    await this.saveToDisk(key, res)
  }

  private async getCached(key: string) {
    if (this.entries[key]) {
      return this.entries[key]
    }

    const fromDisk = await this.loadFromDisk(key)

    if (fromDisk) {
      this.entries[key] = fromDisk

      return this.entries[key]
    }
  }

  private fetchAndAddToCache(url: string, method: string, headers: HeadersObject) {
    const key = this.getCacheKey(url, method, headers)

    if (!this.fetches[key]) {
      this.fetches[key] = fetch(url, {
        headers,
        method,
      })
        .then(async (res) => {
          delete this.fetches[key]

          const bufferedRes = await getBufferedResponse(res)

          if (res.status === 200) {
            this.addToCache(key, bufferedRes)
          }

          return bufferedRes
        })
        .catch(() => {
          delete this.fetches[key]

          return null
        })
    }

    return this.fetches[key]
  }

  private async loadFromDisk(key: string) {
    if (!this.fsPath) {
      return
    }

    const filePath = join(this.fsPath, key)

    try {
      const file = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(file) as BufferedResponse

      if (data.type !== 'json' && data.type !== 'text') {
        throw new Error('Unsupported response type')
      }

      return data
    } catch {
      // no-op
    }
  }

  private async saveToDisk(key: string, res: BufferedResponse) {
    if (!this.fsPath) {
      return
    }

    const data = {
      ...res,
      timestamp: Date.now(),
    }

    try {
      await this.fsPathSetup
      await fs.writeFile(join(this.fsPath, key), JSON.stringify(data))
    } catch {
      // no-op
    }
  }

  async get(url: string, method: string, headers: HeadersObject) {
    const key = this.getCacheKey(url, method, headers)
    const cached = await this.getCached(key)

    if (cached) {
      const currentTimestamp = Date.now()

      if (this.ttl > 0 && currentTimestamp - cached.timestamp <= this.ttl) {
        return cached
      }

      if (this.swr > 0 && currentTimestamp - cached.timestamp <= this.swr) {
        setTimeout(() => {
          this.fetchAndAddToCache(url, method, headers)
        }, 0)

        return cached
      }
    }

    return this.fetchAndAddToCache(url, method, headers)
  }

  getCacheKey(url: string, method: string, headers: HeadersObject) {
    const headersInKey = {
      authorization: headers.Authorization,
    }
    const hash = createHash('md5')
      .update(JSON.stringify({ url, method, headers: headersInKey }))
      .digest('hex')

    return hash
  }
}
