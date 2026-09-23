import type { MinimalHeader } from '@netlify/headers-parser'

import { throwUserError } from '../error.js'
import type { Logs } from '../types/logs.js'

import { logWarning } from './logger.js'

export const ERROR_CALL_TO_ACTION = `Double-check your login status with 'netlify status' or contact support with details of your error.`

export const throwOnInvalidTomlSequence = function (invalidSequence: string): never {
  throwUserError(
    `In netlify.toml, the following backslash should be escaped: ${invalidSequence}
The following should be used instead: \\${invalidSequence}`,
  )
}

export const warnContextPluginConfig = function (logs: Logs | undefined, packageName: string, context: string) {
  logWarning(
    logs,
    `
"${packageName}" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.
To run "${packageName}" in the ${context} context only, uninstall the plugin from the site plugins list.`,
  )
}

export const throwContextPluginsConfig = function (packageName: string, context: string): never {
  throwUserError(
    `
"${packageName}" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.
To run "${packageName}" in the ${context} context only, uninstall the plugin from the site plugins list.
To run "${packageName}" in all contexts, please remove the following section from "netlify.toml".

  [[context.${context}.plugins]]
  package = "${packageName}"
`,
  )
}

type ParsingError = { message: string }

export const warnHeadersParsing = function (logs: Logs | undefined, errors: ParsingError[]) {
  warnParsing(logs, 'headers', errors)
}

export const warnRedirectsParsing = function (logs: Logs | undefined, errors: ParsingError[]) {
  warnParsing(logs, 'redirects', errors)
}

const warnParsing = function (logs: Logs | undefined, kind: 'headers' | 'redirects', errors: ParsingError[]) {
  if (errors.length === 0) {
    return
  }

  const errorMessage = errors.map(({ message }) => message).join('\n\n')
  logWarning(
    logs,
    `
Warning: some ${kind} have syntax errors:

${errorMessage}`,
  )
}

type HeaderName = { forPath: string; headerName: string; lowerHeaderName: string }

/**
 * Headers that differ only in case probably don't behave as intended
 * (https://github.com/netlify/build/issues/2290), so warn about the first such pair.
 */
export const warnHeadersCaseSensitivity = function (logs: Logs | undefined, headers: MinimalHeader[]) {
  const headerNames = headers
    .flatMap(({ for: forPath, values = {} }) => Object.keys(values).map((headerName) => ({ forPath, headerName })))
    .filter(({ headerName }, index, all) => all.slice(index + 1).every((other) => other.headerName !== headerName))
    .map(({ forPath, headerName }): HeaderName => ({ forPath, headerName, lowerHeaderName: headerName.toLowerCase() }))

  const differentCaseHeader = headerNames.find(({ lowerHeaderName }, index, all) =>
    all.slice(index + 1).some((other) => other.lowerHeaderName === lowerHeaderName),
  )
  if (differentCaseHeader === undefined) {
    return
  }

  const sameHeader = headerNames.find(
    ({ headerName, lowerHeaderName }) =>
      differentCaseHeader.headerName !== headerName && differentCaseHeader.lowerHeaderName === lowerHeaderName,
  )
  if (sameHeader === undefined) {
    return
  }

  const sameForPath = sameHeader.forPath === differentCaseHeader.forPath ? ` for "${sameHeader.forPath}"` : ''
  logWarning(
    logs,
    `
Warning: the same header is set twice with different cases${sameForPath}: "${sameHeader.headerName}" and "${differentCaseHeader.headerName}"`,
  )
}
