import { resolve } from 'path'

import { type MinimalHeader, parseAllHeaders } from '@netlify/headers-parser'

import { warnHeadersCaseSensitivity, warnHeadersParsing } from './log/messages.js'
import type { Logs } from './types/logs.js'

/** The `_headers` file in the publish directory, which may not exist. */
export const getHeadersPath = function ({ build: { publish } }: { build: { publish: string } }) {
  return resolve(publish, '_headers')
}

/** Merge `config.headers` with the `_headers` file, and warn about invalid ones. `headers` moves to the end. */
export const addHeaders = async function <T extends { headers?: MinimalHeader[] }>({
  config,
  headersPath,
  logs,
}: {
  config: T
  headersPath: string
  logs: Logs | undefined
}): Promise<T & { headers: MinimalHeader[] }> {
  const { headers: configHeaders, ...rest } = config
  const { headers, errors } = await parseAllHeaders({ headersFiles: [headersPath], configHeaders, minimal: true })
  warnHeadersParsing(logs, errors)
  warnHeadersCaseSensitivity(logs, headers)
  return { ...rest, headers } as T & { headers: MinimalHeader[] }
}
