import path from 'path'

import { type FunctionResult, type NodeBundlerName, RUNTIME } from '@netlify/zip-it-and-ship-it'

import type { ScanResults, groupScanResultsByKeyAndScanType } from '../../plugins_core/secrets_scanning/utils.js'
import type { SystemLogger } from '../../plugins_core/types.js'
import type { GeneratedFunction } from '../../steps/return_values.js'
import { type Logs, log, logArray, logError, logErrorSubHeader, logWarningSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

const logBundleResultFunctions = ({
  functions,
  headerMessage,
  logs,
  error,
}: {
  functions: FunctionResult[]
  headerMessage: string
  logs: Logs | undefined
  error: boolean
}) => {
  const functionNames = functions.map(({ path: functionPath }) => path.basename(functionPath))

  if (error) {
    logErrorSubHeader(logs, headerMessage)
  } else {
    logWarningSubHeader(logs, headerMessage)
  }

  logArray(logs, functionNames)
}

/**
 * Logs the result of bundling functions (user facing)
 */
export const logBundleResults = ({ logs, results = [] }: { logs: Logs | undefined; results?: FunctionResult[] }) => {
  const resultsWithErrors = results.filter(({ bundlerErrors }) => bundlerErrors && bundlerErrors.length !== 0)
  const resultsWithWarnings = results.filter(
    ({ bundler, bundlerWarnings }) => bundler === 'esbuild' && bundlerWarnings && bundlerWarnings.length !== 0,
  )

  if (resultsWithErrors.length !== 0) {
    logBundleResultFunctions({
      functions: resultsWithErrors,
      headerMessage: 'Failed to bundle functions with selected bundler (fallback used):',
      logs,
      error: true,
    })
  }

  if (resultsWithWarnings.length !== 0) {
    logBundleResultFunctions({
      functions: resultsWithWarnings,
      headerMessage: 'Functions bundled with warnings:',
      logs,
      error: false,
    })
  }
}

/**
 * Sibling of `logBundleResults`. Derives structured telemetry from the same
 * `results` array and emits it to the system log and the active span. Returns
 * summary stats the caller can use for metric tags.
 */
export const trackBundleResults = ({
  results = [],
  systemLog,
}: {
  results?: FunctionResult[]
  systemLog: SystemLogger
}): { bundlers: NodeBundlerName[]; fallbackCount: number; warningsCount: number } => {
  // `bundlerErrors` is only set when the user requested `esbuild_zisi` (esbuild
  // with zisi fallback), esbuild failed, and zisi succeeded. The final
  // `bundler` reflects the fallback, so this is our "silent fallback" signal.
  const perFunction = results.map((result) => ({
    name: result.name,
    runtime: result.runtime,
    bundler: result.runtime === RUNTIME.JAVASCRIPT ? result.bundler : null,
    bundlerReason: result.runtime === RUNTIME.JAVASCRIPT ? (result.bundlerReason ?? null) : null,
    sizeBytes: result.size ?? null,
    hadFallback: (result.bundlerErrors?.length ?? 0) > 0,
    hadWarnings: (result.bundlerWarnings?.length ?? 0) > 0,
  }))

  // Exclude both `null` (non-JS runtimes) and `undefined` (prebuilt `.zip`
  // JS functions, which zip-it-and-ship-it passes through with no bundler).
  const jsBundlers = perFunction.map((p) => p.bundler).filter((bundler) => bundler != null)
  const bundlers = [...new Set(jsBundlers)]
  const bundlerCounts = jsBundlers.reduce<Partial<Record<NodeBundlerName, number>>>(
    (acc, bundler) => ({ ...acc, [bundler]: (acc[bundler] ?? 0) + 1 }),
    {},
  )
  const fallbackCount = perFunction.filter((p) => p.hadFallback).length
  const warningsCount = perFunction.filter((p) => p.hadWarnings).length

  systemLog({
    msg: 'Functions bundling completed successfully',
    bundlers,
    bundlerCounts,
    fallbackCount,
    warningsCount,
    functions: perFunction,
  })

  return { bundlers, fallbackCount, warningsCount }
}

export const logFunctionsNonExistingDir = function (logs: Logs | undefined, relativeFunctionsSrc: string | undefined) {
  log(logs, `The Netlify Functions setting targets a non-existing directory: ${String(relativeFunctionsSrc)}`)
}

// Print the list of Netlify Functions about to be bundled
export const logFunctionsToBundle = function ({
  logs,
  userFunctions,
  userFunctionsSrc,
  userFunctionsSrcExists,
  internalFunctions,
  internalFunctionsSrc,
  frameworkFunctions,
  generatedFunctions,
  type = 'Functions',
}: {
  logs: Logs | undefined
  userFunctions: string[]
  userFunctionsSrc: string | undefined
  userFunctionsSrcExists: boolean
  internalFunctions: string[]
  internalFunctionsSrc: string | undefined
  frameworkFunctions: string[]
  generatedFunctions: Record<string, GeneratedFunction[]>
  type?: string
}) {
  let needsSpace = false

  for (const functions of Object.values(generatedFunctions)) {
    const firstFunction = functions.at(0)
    if (firstFunction === undefined) {
      continue
    }

    // Getting the generator block from the first function, since it will be
    // the same for all of them.
    const { generator } = firstFunction
    const functionNames = functions.map((func) => path.basename(func.path))

    if (needsSpace) log(logs, '')

    log(logs, `Packaging ${type} generated by ${THEME.highlightWords(generator.displayName)} ${generator.type}:`)
    logArray(logs, functionNames, { indent: false })

    needsSpace = true
  }

  if (internalFunctions.length !== 0) {
    if (needsSpace) log(logs, '')

    log(logs, `Packaging ${type} from ${THEME.highlightWords(internalFunctionsSrc)} directory:`)
    logArray(logs, internalFunctions, { indent: false })

    needsSpace = true
  }

  if (frameworkFunctions.length !== 0) {
    if (needsSpace) log(logs, '')

    log(logs, `Packaging ${type} generated by your framework:`)
    logArray(logs, frameworkFunctions, { indent: false })

    needsSpace = true
  }

  if (!userFunctionsSrcExists) {
    return
  }

  if (userFunctions.length === 0) {
    log(logs, `No ${type} were found in ${THEME.highlightWords(userFunctionsSrc)} directory`)

    return
  }

  if (needsSpace) log(logs, '')

  log(logs, `Packaging ${type} from ${THEME.highlightWords(userFunctionsSrc)} directory:`)
  logArray(logs, userFunctions, { indent: false })
}

// Print the database provisioning message
export const logDbProvisioning = function ({
  logs,
  branch,
  context,
}: {
  logs: Logs | undefined
  branch: string
  context: string
}) {
  log(logs, `Provisioning database`)

  if (context !== 'production') {
    log(logs, `Creating database branch for ${THEME.highlightWords(branch)}`)
  }
}

// Print the list of database migrations about to be copied
export const logDbMigrations = function ({
  logs,
  migrations,
  srcDir,
}: {
  logs: Logs | undefined
  migrations: string[]
  srcDir: string
}) {
  if (migrations.length === 0) {
    log(logs, `No migrations found in ${THEME.highlightWords(srcDir)} directory`)
    return
  }

  log(logs, `Loading migrations from ${THEME.highlightWords(srcDir)} directory:`)
  logArray(logs, migrations, { indent: false })
}

export const logSecretsScanSkipMessage = function (logs: Logs | undefined, msg: string) {
  log(logs, msg, { color: THEME.warningHighlightWords })
}

export const logSecretsScanSuccessMessage = function (logs: Logs | undefined, msg: string) {
  log(logs, msg, { color: THEME.highlightWords })
}

export const logSecretsScanFailBuildMessage = function ({
  logs,
  scanResults,
  groupedResults,
}: {
  logs: Logs | undefined
  scanResults: ScanResults
  groupedResults: ReturnType<typeof groupScanResultsByKeyAndScanType>
}) {
  const { secretMatches, enhancedSecretMatches } = groupedResults
  const secretMatchesEntries = Object.entries(secretMatches)
  const enhancedSecretMatchesEntries = Object.entries(enhancedSecretMatches)
  const secretMatchesKeys = secretMatchesEntries.map(([key]) => key)
  const enhancedSecretMatchesKeys = enhancedSecretMatchesEntries.map(([key]) => key)

  logErrorSubHeader(
    logs,
    `Scanning complete. ${String(scanResults.scannedFilesCount)} file(s) scanned. Secrets scanning found ${String(secretMatchesKeys.length)} instance(s) of secrets${enhancedSecretMatchesKeys.length > 0 ? ` and ${String(enhancedSecretMatchesKeys.length)} instance(s) of likely secrets` : ''} in build output or repo code.\n`,
  )

  // Explicit secret matches
  secretMatchesEntries.forEach(([key, matches]) => {
    logError(logs, `Secret env var "${key}"'s value detected:`)

    matches
      .sort((a, b) => {
        return a.file > b.file ? 0 : 1
      })
      .forEach(({ lineNumber, file }) => {
        logError(logs, `found value at line ${String(lineNumber)} in ${file}`, { indent: true })
      })
  })

  if (secretMatchesKeys.length) {
    logError(
      logs,
      `\nTo prevent exposing secrets, the build will fail until these secret values are not found in build output or repo files.`,
    )
    logError(
      logs,
      `\nIf these are expected, use SECRETS_SCAN_OMIT_PATHS, SECRETS_SCAN_OMIT_KEYS, or SECRETS_SCAN_ENABLED to prevent detecting.`,
    )
  }

  // Likely secret matches from enhanced scan
  enhancedSecretMatchesEntries.forEach(([key, matches], index) => {
    logError(logs, `${index === 0 && secretMatchesKeys.length ? '\n' : ''}"${key}***" detected as a likely secret:`)

    matches
      .sort((a, b) => {
        return a.file > b.file ? 0 : 1
      })
      .forEach(({ lineNumber, file }) => {
        logError(logs, `found value at line ${String(lineNumber)} in ${file}`, { indent: true })
      })
  })

  if (enhancedSecretMatchesKeys.length) {
    logError(
      logs,
      `\nTo prevent exposing secrets, the build will fail until these likely secret values are not found in build output or repo files.`,
    )
    logError(
      logs,
      `\nIf these are expected, use SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES, or SECRETS_SCAN_SMART_DETECTION_ENABLED to prevent detecting.`,
    )
  }

  logError(
    logs,
    `\nFor more information on secrets scanning, see the Netlify Docs: https://ntl.fyi/configure-secrets-scanning`,
  )
}
