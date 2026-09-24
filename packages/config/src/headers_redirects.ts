import { type MinimalHeader, parseAllHeaders } from '@netlify/headers-parser'
import { parseAllRedirects } from '@netlify/redirect-parser'

import { logWarning } from './log.js'
import type { Header, Logs, Redirect } from './types.js'

/** `_headers` file entries come first, then the configuration's. */
export const mergeHeaders = async function (
  configHeaders: unknown,
  { headersPath, logs }: { headersPath: string | undefined; logs: Logs | undefined },
): Promise<Header[]> {
  const { headers, errors } = await parseAllHeaders({
    headersFiles: headersPath === undefined ? [] : [headersPath],
    // The parser checks the value, whatever its declared type, and reports invalid entries.
    configHeaders: configHeaders as MinimalHeader[] | undefined,
    minimal: true,
  })
  warnSyntaxErrors(logs, 'headers', errors)
  warnHeadersCase(logs, headers)
  return headers
}

/** `_redirects` file entries come first, then the configuration's. */
export const mergeRedirects = async function (
  configRedirects: unknown,
  { redirectsPath, logs }: { redirectsPath: string | undefined; logs: Logs | undefined },
): Promise<Redirect[]> {
  const { redirects, errors } = await parseAllRedirects({
    redirectsFiles: redirectsPath === undefined ? [] : [redirectsPath],
    // Declared as `string[]`, but the parser takes redirect objects and checks the value.
    configRedirects: configRedirects as string[],
    minimal: true,
  })
  warnSyntaxErrors(logs, 'redirects', errors)
  // Declared as `unknown[]`: with `minimal`, the parser returns this shape.
  return redirects as Redirect[]
}

const warnSyntaxErrors = function (logs: Logs | undefined, kind: 'headers' | 'redirects', errors: readonly unknown[]) {
  if (errors.length === 0) {
    return
  }

  const messages = errors.map((error) => (error instanceof Error ? error.message : String(error))).join('\n\n')
  logWarning(
    logs,
    `
Warning: some ${kind} have syntax errors:

${messages}`,
  )
}

/**
 * Headers differing only in case probably don't behave as intended, so the first such pair is
 * reported. Names are deduplicated across paths first, which can drop the ` for "<path>"` (QUIRK).
 */
const warnHeadersCase = function (logs: Logs | undefined, headers: readonly Header[]) {
  const allNames = headers.flatMap(({ for: path, values }) =>
    Object.keys(values).map((name) => ({ path, name, lowerName: name.toLowerCase() })),
  )
  const lastIndexByName = getLastIndexes(allNames.map(({ name }) => name))
  const names = allNames.filter(({ name }, index) => lastIndexByName.get(name) === index)

  const lastIndexByLowerName = getLastIndexes(names.map(({ lowerName }) => lowerName))
  const second = names.find(({ lowerName }, index) => (lastIndexByLowerName.get(lowerName) ?? index) > index)
  if (second === undefined) {
    return
  }

  const first = names.find(({ name, lowerName }) => name !== second.name && lowerName === second.lowerName)
  if (first === undefined) {
    return
  }

  const forPath = first.path === second.path ? ` for "${first.path}"` : ''
  logWarning(
    logs,
    `
Warning: the same header is set twice with different cases${forPath}: "${first.name}" and "${second.name}"`,
  )
}

const getLastIndexes = (keys: readonly string[]): Map<string, number> => new Map(keys.map((key, index) => [key, index]))
