import { resolve } from 'path'

import { type MinimalHeader, parseAllHeaders } from '@netlify/headers-parser'

import { warnHeadersCaseSensitivity, warnHeadersParsing } from './log/messages.js'
import type { Logs } from './types/logs.js'

/** The `_headers` file in the publish directory, which may not exist. */
export const getHeadersPath = function ({ build: { publish } }: { build: { publish: string } }) {
  return resolve(publish, '_headers')
}

/** Merge `config.headers` with the `_headers` file, and warn about invalid ones. `headers` moves to the end. */
export const addHeaders = async function <T extends Record<string, unknown>>({
  config,
  headersPath,
  logs,
}: {
  config: T
  /** Without a path, only `config.headers` is used. */
  headersPath: string | undefined
  logs: Logs | undefined
}): Promise<T & { headers: MinimalHeader[] }> {
  const { headers: configHeaders, ...rest } = config
  const { headers, errors } = await parseAllHeaders({
    headersFiles: headersPath === undefined ? [] : [headersPath],
    // Declared as `MinimalHeader[]` by `@netlify/headers-parser`, which validates what it is given.
    configHeaders: configHeaders as MinimalHeader[] | undefined,
    minimal: true,
  })
  warnHeadersParsing(logs, errors)
  warnHeadersCaseSensitivity(logs, headers)
  return { ...rest, headers } as T & { headers: MinimalHeader[] }
}
