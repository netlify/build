import { createReadStream, promises as fs, existsSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'

import { fdir } from 'fdir'
import { minimatch } from 'minimatch'

import { LIKELY_SECRET_PREFIXES, SAFE_LISTED_VALUES } from './secret_prefixes.js'

export interface ScanResults {
  matches: MatchResult[]
  scannedFilesCount: number
}

interface ScanArgs {
  env: Record<string, unknown>
  keys: string[]
  base: string
  filePaths: string[]
  enhancedScanning?: boolean
  omitValuesFromEnhancedScan?: unknown[]
  useMinimalChunks: boolean
}

interface MatchResult {
  lineNumber: number
  key: string
  file: string
  enhancedMatch: boolean
}

export type SecretScanResult = {
  scannedFilesCount: number
  secretsScanMatches: MatchResult[]
  enhancedSecretsScanMatches: MatchResult[]
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
 * Determine if the user disabled enhanced scanning via env var
 * @param env current envars
 * @returns
 */
export function isEnhancedSecretsScanningEnabled(env: Record<string, unknown>): boolean {
  if (env.ENHANCED_SECRETS_SCAN_ENABLED === false || env.ENHANCED_SECRETS_SCAN_ENABLED === 'false') {
    return false
  }
  return true
}

export function getStringArrayFromEnvValue(env: Record<string, unknown>, envVarName: string): string[] {
  if (typeof env[envVarName] !== 'string') {
    return []
  }
  const omitKeys = env[envVarName]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return omitKeys
}

export function getOmitValuesFromEnhancedScanForEnhancedScanFromEnv(env: Record<string, unknown>): unknown[] {
  return getStringArrayFromEnvValue(env, 'ENHANCED_SECRETS_SCAN_OMIT_VALUES')
}

function filterOmittedKeys(env: Record<string, unknown>, envKeys: string[] = []): string[] {
  const omitKeys = getStringArrayFromEnvValue(env, 'SECRETS_SCAN_OMIT_KEYS')
  return envKeys.filter((key) => !omitKeys.includes(key))
}

/**
 * Trivial values are values that are:
 *  - empty or short strings
 *  - string forms of booleans
 *  - booleans
 *  - numbers or objects with fewer than 4 chars
 */
function isValueTrivial(val): boolean {
  if (typeof val === 'string') {
    // string forms of booleans
    if (val === 'true' || val === 'false') {
      return true
    }
    // trivial values are empty or short strings
    return val.trim().length < 4
  }
  if (typeof val === 'boolean') {
    // booleans are always considered trivial
    return true
  }
  if (typeof val === 'number' || typeof val === 'object') {
    return JSON.stringify(val).length < 4
  }

  return !val
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
  const filteredSecretKeys = filterOmittedKeys(env, secretKeys)
  return filteredSecretKeys.filter((key) => !isValueTrivial(env[key]))
}

// Most prefixes are 4-5 chars, so requiring 12 chars after ensures a reasonable secret length
const MIN_CHARS_AFTER_PREFIX = 12

// Escape special regex characters (like $, *, +, etc) in prefixes so they're treated as literal characters
const prefixMatchingRegex = LIKELY_SECRET_PREFIXES.map((p) => p.replace(/[$*+?.()|[\]{}]/g, '\\$&')).join('|')

// Build regex pattern for matching secrets with various delimiters and quotes:
// (?:["'\`]|[=]) - match either quotes, or = at the start
// Named capturing groups:
//   - <token>: captures the entire secret value including its prefix
//   - <prefix>: captures just the prefix part (e.g. 'aws_', 'github_pat_')
// (?:${prefixMatchingRegex}) - non-capturing group containing our escaped prefixes (e.g. aws_|github_pat_|etc)
// [a-zA-Z0-9-]{${MIN_CHARS_AFTER_PREFIX}} - match exactly MIN_CHARS_AFTER_PREFIX chars (alphanumeric or dash) after the prefix
// [a-zA-Z0-9-]*? - lazily match any additional chars (alphanumeric or dash)
// (?:["'\`]|$) - end with either quotes or end of line
// gi - global and case insensitive flags
// Note: Using the global flag (g) means this regex object maintains state between executions.
// We would need to reset lastIndex to 0 if we wanted to reuse it on the same string multiple times.
const likelySecretRegex = new RegExp(
  `(?:["'\`]|[=]) *(?<token>(?<prefix>${prefixMatchingRegex})[a-zA-Z0-9-]{${MIN_CHARS_AFTER_PREFIX}}[a-zA-Z0-9-]*?)(?:["'\`]|$)`,
  'gi',
)

/**
 * Checks a chunk of text for likely secrets based on known prefixes and patterns.
 * The function works by:
 * 1. Splitting the chunk into tokens using quotes, whitespace, equals signs, colons, and commas as delimiters
 * 2. For each token, checking if it matches our secret pattern:
 *    - Must start (^) with one of our known prefixes (e.g. aws_, github_pat_, etc)
 *    - Must be followed by at least MIN_CHARS_AFTER_PREFIX non-whitespace characters
 *    - Must extend to the end ($) of the token
 *
 * For example, given the chunk: secretKey='aws_123456789012345678'
 * 1. It's split into tokens: ['secretKey', 'aws_123456789012345678']
 * 2. Each token is checked against the regex pattern:
 *    - 'secretKey' doesn't match (doesn't start with a known prefix)
 *    - 'aws_123456789012345678' matches (starts with 'aws_' and has sufficient length)
 *
 */
export function findLikelySecrets({
  text,
  omitValuesFromEnhancedScan = [],
}: {
  /**
   * Text to check
   */
  text: string
  /**
   * Optional array of values to exclude from matching
   */
  omitValuesFromEnhancedScan?: unknown[]
}): { index: number; prefix: string }[] {
  if (!text) return []

  const matches: ReturnType<typeof findLikelySecrets> = []
  let match: RegExpExecArray | null
  const allOmittedValues = [...omitValuesFromEnhancedScan, ...SAFE_LISTED_VALUES]

  while ((match = likelySecretRegex.exec(text)) !== null) {
    const token = match.groups?.token
    const prefix = match.groups?.prefix
    if (!token || !prefix || allOmittedValues.includes(token)) {
      continue
    }
    matches.push({
      prefix,
      index: match.index,
    })
  }

  return matches
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
export async function scanFilesForKeyValues({
  env,
  keys,
  filePaths,
  base,
  enhancedScanning,
  omitValuesFromEnhancedScan = [],
  useMinimalChunks = false,
}: ScanArgs): Promise<ScanResults> {
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

  const searchStream = useMinimalChunks ? searchStreamMinimalChunks : searchStreamReadline

  // process the scanning in batches to not run into memory issues by
  // processing all files at the same time.
  while (filePaths.length > 0) {
    const chunkSize = 200
    const batch = filePaths.splice(0, chunkSize)

    settledPromises = settledPromises.concat(
      await Promise.allSettled(
        batch.map((file) => {
          return searchStream({ basePath: base, file, keyValues, enhancedScanning, omitValuesFromEnhancedScan })
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

type SearchStreamOptions = {
  basePath: string
  file: string
  keyValues: Record<string, string[]>
  enhancedScanning?: boolean
  omitValuesFromEnhancedScan?: unknown[]
}

/**
 * Search stream implementation using node:readline
 */
const searchStreamReadline = ({
  basePath,
  file,
  keyValues,
  enhancedScanning,
  omitValuesFromEnhancedScan = [],
}: SearchStreamOptions): Promise<MatchResult[]> => {
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
        if (enhancedScanning) {
          matches.push(
            ...findLikelySecrets({ text: line, omitValuesFromEnhancedScan }).map(({ prefix }) => ({
              key: prefix,
              file,
              lineNumber,
              enhancedMatch: true,
            })),
          )
        }
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
              enhancedMatch: false,
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
                enhancedMatch: false,
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
 * Search stream implementation using just read stream that allows to buffer less content
 */
const searchStreamMinimalChunks = ({
  basePath,
  file,
  keyValues,
  enhancedScanning,
  omitValuesFromEnhancedScan = [],
}: SearchStreamOptions): Promise<MatchResult[]> => {
  return new Promise((resolve, reject) => {
    const matches: MatchResult[] = []

    const keyVals: string[] = ([] as string[]).concat(...Object.values(keyValues))

    // determine longest value that we will search for - needed to determine minimal size of rolling buffer
    const maxValLength = Math.max(
      0,
      // explicit secrets
      ...keyVals.map((v) => v.length),
      ...(enhancedScanning
        ? [
            // omitted likely secrets (after finding likely secret we check if it should be omitted, so we need to capture at least size of omitted values)
            ...omitValuesFromEnhancedScan.map((v) => (typeof v === 'string' ? v.length : 0)),
            // minimum length needed to find likely secret
            ...LIKELY_SECRET_PREFIXES.map((v) => v.length + MIN_CHARS_AFTER_PREFIX),
          ]
        : []),
    )

    if (maxValLength === 0) {
      // no non-empty values to scan for
      resolve(matches)
      return
    }

    const filePath = path.resolve(basePath, file)

    const inStream = createReadStream(filePath)

    function getKeyForValue(val) {
      let key = ''
      for (const [secretKeyName, valuePermutations] of Object.entries(keyValues)) {
        if (valuePermutations.includes(val)) {
          key = secretKeyName
        }
      }
      return key
    }

    let buffer = ''

    let newLinesIndexesInCurrentBuffer: number[] | null = null
    function getCurrentBufferNewLineIndexes() {
      if (newLinesIndexesInCurrentBuffer === null) {
        newLinesIndexesInCurrentBuffer = [] as number[]
        let newLineIndex = -1
        while ((newLineIndex = buffer.indexOf('\n', newLineIndex + 1)) !== -1) {
          newLinesIndexesInCurrentBuffer.push(newLineIndex)
        }
      }

      return newLinesIndexesInCurrentBuffer
    }

    /**
     * Amount of characters that were fully processed. Used to determine absolute position of current rolling buffer
     * in the file.
     */
    let processedCharacters = 0
    /**
     * Amount of lines that were fully processed. Used to determine absolute line number of matches in current rolling buffer.
     */
    let processedLines = 0
    /**
     * Map keeping track of found secrets in current file. Used to prevent reporting same secret+position multiple times.
     * Needed because rolling buffer might retain same secret in multiple passes.
     */
    const foundIndexes = new Map<string, Set<number>>()
    /**
     * We report given secret at most once per line, so we keep track lines we already reported for given secret.
     */
    const foundLines = new Map<string, Set<number>>()

    /**
     * Calculate absolute line number in a file for given match in the current rolling buffer.
     */
    function getLineNumberForMatchInTheBuffer({ indexInBuffer, key }: { indexInBuffer: number; key: string }) {
      const absolutePositionInFile = processedCharacters + indexInBuffer

      // check if we already handled match for given key in this position
      let foundIndexesForKey = foundIndexes.get(key)
      if (!foundIndexesForKey?.has(absolutePositionInFile)) {
        // ensure we track match for this key and position to not report it again in future passes
        if (!foundIndexesForKey) {
          foundIndexesForKey = new Set<number>()
          foundIndexes.set(key, foundIndexesForKey)
        }
        foundIndexesForKey.add(absolutePositionInFile)

        // calculate line number based on amount of fully processed lines and position of line breaks in current buffer
        let lineNumber = processedLines + 1
        for (const newLineIndex of getCurrentBufferNewLineIndexes()) {
          if (indexInBuffer > newLineIndex) {
            lineNumber++
          } else {
            break
          }
        }

        // check if we already handled match for given key in this line
        let foundLinesForKey = foundLines.get(key)
        if (!foundLinesForKey?.has(lineNumber)) {
          if (!foundLinesForKey) {
            foundLinesForKey = new Set<number>()
            foundLines.set(key, foundLinesForKey)
          }
          foundLinesForKey.add(lineNumber)

          // only report line number if we didn't report it yet for this key
          return lineNumber
        }
      }
    }

    function processBuffer() {
      for (const valVariant of keyVals) {
        let indexInBuffer = -1
        while ((indexInBuffer = buffer.indexOf(valVariant, indexInBuffer + 1)) !== -1) {
          const key = getKeyForValue(valVariant)
          const lineNumber = getLineNumberForMatchInTheBuffer({
            indexInBuffer,
            key,
          })

          if (typeof lineNumber === 'number') {
            matches.push({
              file,
              lineNumber,
              key,
              enhancedMatch: false,
            })
          }
        }
      }

      if (enhancedScanning) {
        const likelySecrets = findLikelySecrets({ text: buffer, omitValuesFromEnhancedScan })
        for (const { index, prefix } of likelySecrets) {
          const lineNumber = getLineNumberForMatchInTheBuffer({
            indexInBuffer: index,
            key: prefix,
          })

          if (typeof lineNumber === 'number') {
            matches.push({
              file,
              lineNumber,
              key: prefix,
              enhancedMatch: true,
            })
          }
        }
      }
    }

    inStream.on('data', function (chunk) {
      buffer += chunk.toString()

      // reset new line positions in current buffer
      newLinesIndexesInCurrentBuffer = null

      if (buffer.length > maxValLength) {
        // only process if buffer is large enough to contain longest secret, if final chunk isn't large enough
        // it will be processed in `close` event handler
        processBuffer()

        // we will keep maxValLength characters in the buffer, surplus of characters at this point is fully processed
        const charactersInBufferThatWereFullyProcessed = buffer.length - maxValLength
        processedCharacters += charactersInBufferThatWereFullyProcessed

        // advance processed lines
        for (const newLineIndex of getCurrentBufferNewLineIndexes()) {
          if (newLineIndex < charactersInBufferThatWereFullyProcessed) {
            processedLines++
          } else {
            break
          }
        }

        // Keep the last part of the buffer to handle split values across chunks
        buffer = buffer.slice(charactersInBufferThatWereFullyProcessed)
      }
    })

    inStream.on('error', function (error: any) {
      if (error?.code === 'EISDIR') {
        // file path is a directory - do nothing
        resolve(matches)
      } else {
        reject(error)
      }
    })

    inStream.on('close', function () {
      // process any remaining buffer content
      processBuffer()
      resolve(matches)
    })
  })
}

/**
 * ScanResults are all of the finds for all keys and their disparate locations. Scanning is
 * async in streams so order can change a lot. Some matches are the result of an env var explictly being marked as secret,
 * while others are part of the enhanced secret scan.
 *
 * This function groups the results into an object where the results are separate into the secretMatches and enhancedSecretMatches,
 * their value being an object where the keys are the env var keys and the values are all match results for that key.
 *
 * @param scanResults
 * @returns
 */
export function groupScanResultsByKeyAndScanType(scanResults: ScanResults): {
  secretMatches: { [key: string]: MatchResult[] }
  enhancedSecretMatches: { [key: string]: MatchResult[] }
} {
  const secretMatchesByKeys: { [key: string]: MatchResult[] } = {}
  const enhancedSecretMatchesByKeys: { [key: string]: MatchResult[] } = {}
  scanResults.matches.forEach((matchResult) => {
    if (matchResult.enhancedMatch) {
      if (!enhancedSecretMatchesByKeys[matchResult.key]) {
        enhancedSecretMatchesByKeys[matchResult.key] = []
      }
      enhancedSecretMatchesByKeys[matchResult.key].push(matchResult)
    } else {
      if (!secretMatchesByKeys[matchResult.key]) {
        secretMatchesByKeys[matchResult.key] = []
      }
      secretMatchesByKeys[matchResult.key].push(matchResult)
    }
  })

  // sort results to get a consistent output and logically ordered match results
  const sortMatches = (matchesByKeys: { [key: string]: MatchResult[] }) => {
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
  }

  sortMatches(secretMatchesByKeys)
  sortMatches(enhancedSecretMatchesByKeys)

  return { secretMatches: secretMatchesByKeys, enhancedSecretMatches: enhancedSecretMatchesByKeys }
}

function isMultiLineVal(v) {
  return typeof v === 'string' && v.includes('\n')
}
