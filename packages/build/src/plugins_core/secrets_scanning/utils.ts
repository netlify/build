import { createReadStream, promises as fs, existsSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'

import { fdir } from 'fdir'
import { minimatch } from 'minimatch'

export interface ScanResults {
  matches: MatchResult[]
  scannedFilesCount: number
}

interface ScanArgs {
  env: Record<string, unknown>
  keys: string[]
  base: string
  filePaths: string[]
}

interface MatchResult {
  lineNumber: number
  key: string
  file: string
}

/**
 * Determine if the user disabled scanning via env var
 * @param env current envars
 * @returns
 */
export function isSecretsScanningEnabled(env: Record<string, unknown>): boolean {
  if (env.SECRETS_SCAN_ENABLED === false || env.SECRETS_SCAN_ENABLED === 'false') {
    return false
  }
  return true
}

/**
 * given the explicit secret keys and env vars, return the list of secret keys which have non-empty or non-trivial values. This
 * will also filter out keys passed in the SECRETS_SCAN_OMIT_KEYS env var.
 *
 * non-trivial values are values that are:
 *  - >4 characters/digits
 *  - not booleans
 *
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
      // string forms of booleans
      if (val === 'true' || val === 'false') {
        return false
      }

      // non-trivial/non-empty values only
      return val.trim().length > 4
    } else if (typeof val === 'boolean') {
      // booleans are trivial values
      return false
    } else if (typeof val === 'number' || typeof val === 'object') {
      return JSON.stringify(val).length > 4
    }

    return !!val
  })
}

/**
 * Given the env and base directory, find all file paths to scan. It will look at the
 * env vars to decide if it should omit certain paths.
 *
 * @param options
 * @returns string[] of relative paths from base of files that should be searched
 */
export async function getFilePathsToScan({ env, base }): Promise<string[]> {
  const omitPathsAlways = ['.git/', '.cache/']

  // node modules is dense and is only useful to scan if the repo itself commits these
  // files. As a simple check to understand if the repo would commit these files, we expect
  // that they would not ignore them from their git settings. So if gitignore includes
  // node_modules anywhere we will omit looking in those folders - this will allow repos
  // that do commit node_modules to still scan them.
  let ignoreNodeModules = false

  const gitignorePath = path.resolve(base, '.gitignore')
  const gitignoreContents = existsSync(gitignorePath) ? await fs.readFile(gitignorePath, 'utf-8') : ''

  if (gitignoreContents?.includes('node_modules')) {
    ignoreNodeModules = true
  }

  let files = await new fdir()
    .withRelativePaths()
    .filter((path) => {
      if (ignoreNodeModules && path.includes('node_modules')) {
        return false
      }
      return true
    })
    .crawl(base)
    .withPromise()

  // normalize the path separators to all use the forward slash
  // this is needed for windows machines and snapshot tests consistency.
  files = files.map((f) => f.split(path.sep).join('/'))

  let omitPaths: string[] = []
  if (typeof env.SECRETS_SCAN_OMIT_PATHS === 'string') {
    omitPaths = env.SECRETS_SCAN_OMIT_PATHS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  omitPaths = omitPaths.concat(omitPathsAlways)

  if (omitPaths.length > 0) {
    files = files.filter((relativePath) => !omitPathMatches(relativePath, omitPaths))
  }

  return files
}

// omit paths are relative path substrings.
const omitPathMatches = (relativePath, omitPaths) => {
  return omitPaths.some((oPath) => {
    // check if the substring matches or glob pattern
    return relativePath.startsWith(oPath) || minimatch(relativePath, oPath, { dot: true })
  })
}

/**
 * Given the env vars, the current keys, paths, etc. Look across the provided files to find the values
 * of the secrets based on the keys provided. It will process files separately in different read streams.
 * The values that it looks for will be a unique set of plaintext, base64 encoded, and uri encoded permutations
 * of each value - to catch common permutations that occur post build.
 *
 * @param scanArgs {ScanArgs} scan options
 * @returns promise with all of the scan results, if any
 */
export async function scanFilesForKeyValues({ env, keys, filePaths, base }: ScanArgs): Promise<ScanResults> {
  const scanResults: ScanResults = {
    matches: [],
    scannedFilesCount: 0,
  }

  const keyValues: Record<string, string[]> = keys.reduce((kvs, key) => {
    let val = env[key]

    if (typeof val === 'number' || typeof val === 'object') {
      val = JSON.stringify(val)
    }

    if (typeof val === 'string') {
      // to detect the secrets effectively
      // normalize the value so that we remove leading and
      // ending whitespace and newline characters
      const normalizedVal = val.replace(/^\s*/, '').replace(/\s*$/, '')

      kvs[key] = Array.from(
        new Set([normalizedVal, Buffer.from(normalizedVal).toString('base64'), encodeURIComponent(normalizedVal)]),
      )
    }
    return kvs
  }, {})

  scanResults.scannedFilesCount = filePaths.length

  let settledPromises: PromiseSettledResult<MatchResult[]>[] = []

  // process the scanning in batches to not run into memory issues by
  // processing all files at the same time.
  while (filePaths.length > 0) {
    const chunkSize = 200
    const batch = filePaths.splice(0, chunkSize)

    settledPromises = settledPromises.concat(
      await Promise.allSettled(
        batch.map((file) => {
          return searchStream(base, file, keyValues)
        }),
      ),
    )
  }

  settledPromises.forEach((result) => {
    if (result.status === 'fulfilled' && result.value?.length > 0) {
      scanResults.matches = scanResults.matches.concat(result.value)
    }
  })

  return scanResults
}

const searchStream = (basePath: string, file: string, keyValues: Record<string, string[]>): Promise<MatchResult[]> => {
  return new Promise((resolve, reject) => {
    const filePath = path.resolve(basePath, file)

    const inStream = createReadStream(filePath)
    const rl = createInterface({ input: inStream, terminal: false })
    const matches: MatchResult[] = []

    const keyVals: string[] = ([] as string[]).concat(...Object.values(keyValues))

    function getKeyForValue(val) {
      let key = ''
      for (const [secretKeyName, valuePermutations] of Object.entries(keyValues)) {
        if (valuePermutations.includes(val)) {
          key = secretKeyName
        }
      }
      return key
    }

    // how many lines is the largest multiline string
    let maxMultiLineCount = 1

    keyVals.forEach((valVariant) => {
      maxMultiLineCount = Math.max(maxMultiLineCount, valVariant.split('\n').length)
    })

    const lines: string[] = []

    let lineNumber = 0

    rl.on('line', function (line) {
      // iterating here so the first line will always appear as line 1 to be human friendly
      // and match what an IDE would show for a line number.
      lineNumber++
      if (typeof line === 'string') {
        if (maxMultiLineCount > 1) {
          lines.push(line)
        }

        // only track the max number of lines needed to match our largest
        // multiline value. If we get above that remove the first value from the list
        if (lines.length > maxMultiLineCount) {
          lines.shift()
        }

        keyVals.forEach((valVariant) => {
          // matching of single/whole values
          if (line.includes(valVariant)) {
            matches.push({
              file,
              lineNumber,
              key: getKeyForValue(valVariant),
            })
            return
          }

          // matching of multiline values
          if (isMultiLineVal(valVariant)) {
            // drop empty values at beginning and end
            const multiStringLines = valVariant.split('\n')

            // drop early if we don't have enough lines for all values
            if (lines.length < multiStringLines.length) {
              return
            }

            let stillMatches = true
            let fullMatch = false

            multiStringLines.forEach((valLine, valIndex) => {
              if (valIndex === 0) {
                // first lines have to end with the line value
                if (!lines[valIndex].endsWith(valLine)) {
                  stillMatches = false
                }
              } else if (valIndex !== multiStringLines.length - 1) {
                // middle lines have to have full line match
                // middle lines
                if (lines[valIndex] !== valLine) {
                  stillMatches = false
                }
              } else {
                // last lines have start with the value
                if (!lines[valIndex].startsWith(valLine)) {
                  stillMatches = false
                }

                if (stillMatches === true) {
                  fullMatch = true
                }
              }
            })

            if (fullMatch) {
              matches.push({
                file,
                lineNumber: lineNumber - lines.length + 1,
                key: getKeyForValue(valVariant),
              })
              return
            }
          }
        })
      }
    })

    rl.on('error', function (error) {
      if (error?.code === 'EISDIR') {
        // file path is a directory - do nothing
        resolve(matches)
      } else {
        reject(error)
      }
    })

    rl.on('close', function () {
      resolve(matches)
    })
  })
}

/**
 * ScanResults are all of the finds for all keys and their disparate locations. Scanning is
 * async in streams so order can change a lot. This function groups the results into an object
 * where the keys are the env var keys and the values are all match results for that key
 *
 * @param scanResults
 * @returns
 */
export function groupScanResultsByKey(scanResults: ScanResults): { [key: string]: MatchResult[] } {
  const matchesByKeys: { [key: string]: MatchResult[] } = {}
  scanResults.matches.forEach((matchResult) => {
    if (!matchesByKeys[matchResult.key]) {
      matchesByKeys[matchResult.key] = []
    }
    matchesByKeys[matchResult.key].push(matchResult)
  })

  // sort results to get a consistent output and logically ordered match results
  Object.keys(matchesByKeys).forEach((key) => {
    matchesByKeys[key].sort((a, b) => {
      // sort by file name first
      if (a.file > b.file) {
        return 1
      }

      // sort by line number second
      if (a.file === b.file) {
        if (a.lineNumber > b.lineNumber) {
          return 1
        }
        if (a.lineNumber === b.lineNumber) {
          return 0
        }
        return -1
      }
      return -1
    })
  })
  return matchesByKeys
}

function isMultiLineVal(v) {
  return typeof v === 'string' && v.includes('\n')
}
