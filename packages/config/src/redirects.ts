import { resolve } from 'path'

import { parseAllRedirects } from '@netlify/redirect-parser'

import { warnRedirectsParsing } from './log/messages.js'
import type { Redirect } from './types/config.js'
import type { Logs } from './types/logs.js'

/** The `_redirects` file in the publish directory, which may not exist. */
export const getRedirectsPath = function ({ build: { publish } }: { build: { publish: string } }) {
  return resolve(publish, '_redirects')
}

/** Merge `config.redirects` with the `_redirects` file, and warn about invalid ones. `redirects` moves to the end. */
export const addRedirects = async function <T extends Record<string, unknown>>({
  config,
  redirectsPath,
  logs,
}: {
  config: T
  /** Without a path, only `config.redirects` is used. */
  redirectsPath: string | undefined
  logs: Logs | undefined
}): Promise<T & { redirects: Redirect[] }> {
  const { redirects: configRedirects, ...rest } = config
  const { redirects, errors } = await parseAllRedirects({
    redirectsFiles: redirectsPath === undefined ? [] : [redirectsPath],
    // Declared as `string[]` by `@netlify/redirect-parser`, which actually takes redirect objects.
    configRedirects: configRedirects as string[],
    minimal: true,
  })
  warnRedirectsParsing(logs, errors as { message: string }[])
  return { ...rest, redirects: redirects as Redirect[] } as T & { redirects: Redirect[] }
}
