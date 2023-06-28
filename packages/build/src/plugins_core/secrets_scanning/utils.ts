import { createReadStream } from 'node:fs'
import path from 'node:path'
import { promises as readline } from 'node:readline'

import { fdir } from 'fdir'

export function isSecretsScanningEnabled(env: Record<string, unknown>): boolean {
  if (env.SECRETS_SCAN_ENABLED === false || env.SECRETS_SCAN_ENABLED === 'false') {
    return false
  }
  return true
}

/**
 * given the explicit secret keys and evn vars, return the list of secret keys which have non-empty values. This
 * will also filter out keys passed in the SECRETS_SCAN_OMIT_KEYS env var.
 * @param env env vars list
 * @param secretKeys
 * @returns string[]
 */
export function getSecretKeysToScanFor(env: Record<string, unknown>, secretKeys: string[]): string[] {
  let omitKeys: string[] = []
  if (typeof env.SECRETS_SCAN_OMIT_KEYS === 'string') {
    omitKeys = env.SECRETS_SCAN_OMIT_KEYS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  return secretKeys.filter((key) => {
    if (omitKeys.includes(key)) {
      return false
    }

    const val = env[key]
    if (typeof val === 'string') {
      return !!val.trim()
    }
    return !!val
  })
}

export async function getFilePathsToScan({ env, base }): Promise<string[]> {
  let files = await new fdir().withRelativePaths().crawl(base).withPromise()

  let omitPaths: string[] = []
  if (typeof env.SECRETS_SCAN_OMIT_PATHS === 'string') {
    omitPaths = env.SECRETS_SCAN_OMIT_PATHS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  if (omitPaths.length > 0) {
    files = files.filter((relativePath) => !omitPathMatches(relativePath, omitPaths))
  }

  return files
}

// omit paths are relative path substrings.
const omitPathMatches = (relativePath, omitPaths) => omitPaths.some((oPath) => relativePath.startsWith(oPath))

interface ScanResults {
  matches: MatchResult[]
}

interface ScanArgs {
  env: Record<string, unknown>
  keys: string[]
  base: string
  filePaths: string[]
}

export interface MatchResult {
  lineNumber: number
  key: string
  file: string
}

export async function scanFilesForKeyValues({ env, keys, filePaths, base }: ScanArgs): Promise<ScanResults> {
  const scanResults: ScanResults = {
    matches: [],
  }

  const keyValues: Record<string, string[]> = keys.reduce((kvs, key) => {
    const val = env[key]

    if (typeof val === 'string') {
      kvs[key] = Array.from(new Set([val, btoa(val), encodeURIComponent(val)]))
    }
    return kvs
  }, {})

  const settledPromises = await Promise.allSettled(
    filePaths.map((file) => {
      return searchStream(base, file, keyValues)
    }),
  )

  settledPromises.forEach((result) => {
    if (result.status === 'fulfilled' && result.value?.length > 0) {
      scanResults.matches = scanResults.matches.concat(result.value)
    }
  })

  return scanResults
}

const searchStream = (basePath: string, file: string, keyValues: Record<string, string[]>): Promise<MatchResult[]> => {
  return new Promise((resolve) => {
    const filePath = path.resolve(basePath, file)

    const inStream = createReadStream(filePath)
    const rl = readline.createInterface(inStream)
    const matches: MatchResult[] = []

    const keyVals: string[] = ([] as string[]).concat(...Object.values(keyValues))

    let lineNumber = 0
    rl.on('line', function (line) {
      lineNumber++
      if (line) {
        keyVals.some((s) => {
          if (line.search(new RegExp(s)) >= 0) {
            let key

            for (const [k, v] of Object.entries(keyValues)) {
              if (v.includes(s)) {
                key = k
              }
            }

            matches.push({
              file,
              lineNumber,
              key,
            })
          }
        })
      }
    })

    rl.on('close', function () {
      resolve(matches)
    })
  })
}

export function groupScanResultsByKey(scanResults: ScanResults): { [key: string]: MatchResult[] } {
  const matchesByKeys: { [key: string]: MatchResult[] } = {}
  scanResults.matches.forEach((matchResult) => {
    if (!matchesByKeys[matchResult.key]) {
      matchesByKeys[matchResult.key] = []
    }
    matchesByKeys[matchResult.key].push(matchResult)
  })
  return matchesByKeys
}
