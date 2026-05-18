import { promises as fs } from 'fs'
import { basename, extname, dirname, join } from 'path'

import type { FunctionRegion } from '@netlify/types'
import isPathInside from 'is-path-inside'
// @ts-expect-error(serhalp) -- Remove once https://github.com/schnittstabil/merge-options/pull/28 is merged, or replace
// this dependency.
import mergeOptions from 'merge-options'
import { z } from 'zod'

import { FunctionSource } from './function.js'
import { nodeBundler } from './runtimes/node/bundlers/types.js'
import { moduleFormat } from './runtimes/node/utils/module_format.js'
import { minimatch } from './utils/matching.js'
import { parseMemoryMB } from './utils/parse_memory.js'

// We only need the list of valid region codes here (to feed into Zod's
// `enum` for runtime validation). The natural shape would be a literal
// array, but TypeScript has no way to enforce that an array contains every
// member of a union type — it can only check that each element belongs to
// the union, not that none are missing.
//
// A Record keyed by the union, however, IS exhaustiveness-checked: with
// `satisfies Record<FunctionRegion, ...>`, TypeScript refuses to compile
// if any region in `FunctionRegion` is absent here, or if anything here
// isn't a valid `FunctionRegion`.
const FUNCTION_REGION_KEYS = {
  cmh: null,
  dub: null,
  fra: null,
  gru: null,
  iad: null,
  lhr: null,
  nrt: null,
  pdx: null,
  sfo: null,
  sin: null,
  syd: null,
  yul: null,
} as const satisfies Record<FunctionRegion, null>

const FUNCTION_REGION_CODES = Object.keys(FUNCTION_REGION_KEYS) as [FunctionRegion, ...FunctionRegion[]]

// Accept any casing in source (`iad`, `IAD`, `Iad`) but normalize to lower
// case before validating and writing to the manifest.
const functionRegion = z.preprocess(
  (input) => (typeof input === 'string' ? input.toLowerCase() : input),
  z.enum(FUNCTION_REGION_CODES),
)

const FUNCTION_MEMORY_MIN_MB = 1024
const FUNCTION_MEMORY_MAX_MB = 4096

const functionMemory = z.preprocess(
  (input) => (typeof input === 'string' || typeof input === 'number' ? parseMemoryMB(input) : input),
  z.number().int().min(FUNCTION_MEMORY_MIN_MB).max(FUNCTION_MEMORY_MAX_MB),
)

export const functionConfig = z.object({
  externalNodeModules: z.array(z.string()).optional().catch([]),
  generator: z.string().optional().catch(undefined),
  includedFiles: z.array(z.string()).optional().catch([]),
  includedFilesBasePath: z.string().optional().catch(undefined),
  ignoredNodeModules: z.array(z.string()).optional().catch([]),
  name: z.string().optional().catch(undefined),
  nodeBundler: nodeBundler.optional().catch(undefined),
  nodeSourcemap: z.boolean().optional().catch(undefined),
  nodeVersion: z.string().optional().catch(undefined),
  memory: functionMemory.optional(),
  region: functionRegion.optional(),
  rustTargetDirectory: z.string().optional().catch(undefined),
  schedule: z.string().optional().catch(undefined),
  timeout: z.number().optional().catch(undefined),
  zipGo: z.boolean().optional().catch(undefined),

  // Temporary configuration property, only meant to be used by the deploy
  // configuration API. Once we start emitting ESM files for all ESM functions,
  // we can remove this.
  nodeModuleFormat: moduleFormat.optional().catch(undefined),
})

type FunctionConfig = z.infer<typeof functionConfig>

interface FunctionConfigFile {
  config: FunctionConfig
  version: number
}

type GlobPattern = string

type Config = Record<GlobPattern, FunctionConfig>
type FunctionWithoutConfig = Omit<FunctionSource, 'config'>

const getConfigForFunction = async ({
  config,
  configFileDirectories,
  func,
}: {
  config?: Config
  configFileDirectories?: string[]
  func: FunctionWithoutConfig
}): Promise<FunctionConfig> => {
  const fromConfig = getFromMainConfig({ config, func })

  // We try to read from a function config file if the function directory is
  // inside one of `configFileDirectories`.
  const shouldReadConfigFile = configFileDirectories?.some((directory) => isPathInside(func.mainFile, directory))

  if (!shouldReadConfigFile) {
    return fromConfig
  }

  const fromFile = await getFromFile(func)

  return {
    ...fromConfig,
    ...fromFile,
  }
}

const getFromMainConfig = ({
  config,
  func,
}: {
  config?: Config
  configFileDirectories?: string[]
  func: FunctionWithoutConfig
}): FunctionConfig => {
  if (!config) {
    return {}
  }

  // It's safe to mutate the array because it's local to this function.
  const matches = Object.keys(config)
    .filter((expression) => minimatch(func.name, expression))
    .map((expression) => {
      const wildcardCount = [...expression].filter((char) => char === '*').length

      // The weight increases with the number of hardcoded (i.e. non-wildcard)
      // characters — e.g. "netlify" has a higher weight than "net*". We do a
      // subtraction of 1 if there is at least one wildcard character, so that
      // "netlify" has a higher weight than "netlify*".
      const weight = expression.length - wildcardCount - (wildcardCount === 0 ? 0 : 1)

      return {
        expression,
        weight,
      }
    })
    .sort(({ weight: weightA }, { weight: weightB }) => weightA - weightB)
    .map(({ expression }) => config[expression])

  return mergeOptions.apply({ concatArrays: true, ignoreUndefined: true }, matches)
}

const getFromFile = async (func: FunctionWithoutConfig): Promise<FunctionConfig> => {
  const filename = `${basename(func.mainFile, extname(func.mainFile))}.json`
  const configFilePath = join(dirname(func.mainFile), filename)

  try {
    const data = await fs.readFile(configFilePath, 'utf8')
    const configFile = JSON.parse(data) as FunctionConfigFile

    if (configFile.version === 1) {
      return configFile.config
    }
  } catch {
    // no-op
  }

  return {}
}

export { Config, FunctionConfig, FunctionWithoutConfig, getConfigForFunction }
