import { promises as fs } from 'fs'
import { join } from 'path'
import { pathToFileURL } from 'url'

import { SemVer } from 'semver'
import tmp from 'tmp-promise'

import { DenoBridge } from './bridge.js'
import { BundleError } from './bundle_error.js'
import { ImportMap } from './import_map.js'
import { Logger } from './logger.js'
import { getPackagePath } from './package_json.js'
import { RateLimit } from './rate_limit.js'

enum ConfigExitCode {
  Success = 0,
  UnhandledError = 1,
  ImportError,
  NoConfig,
  InvalidExport,
  SerializationError,
  InvalidDefaultExport,
}

export const enum Cache {
  Off = 'off',
  Manual = 'manual',
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

export type Path = `/${string}`

export type OnError = 'fail' | 'bypass' | Path

export const isValidOnError = (value: unknown): value is OnError => {
  if (typeof value === 'undefined') return true
  if (typeof value !== 'string') return false
  return value === 'fail' || value === 'bypass' || value.startsWith('/')
}

export type HeadersConfig = Record<string, boolean | string>

interface BaseFunctionConfig {
  cache?: Cache
  header?: HeadersConfig
  onError?: OnError
  name?: string
  generator?: string
  method?: HTTPMethod | HTTPMethod[]
  rateLimit?: RateLimit
}

interface FunctionConfigWithPath extends BaseFunctionConfig {
  path?: Path | Path[]
  excludedPath?: Path | Path[]
}

interface FunctionConfigWithPattern extends BaseFunctionConfig {
  pattern: string | string[]
  excludedPattern?: string | string[]
}

export type FunctionConfig = FunctionConfigWithPath | FunctionConfigWithPattern

export type FunctionConfigWithAllPossibleFields = BaseFunctionConfig &
  Partial<FunctionConfigWithPath & FunctionConfigWithPattern>

const getConfigExtractor = () => {
  const packagePath = getPackagePath()
  const configExtractorPath = join(packagePath, 'deno', 'config.ts')

  return configExtractorPath
}

export const getFunctionConfig = async ({
  deno,
  functionPath,
  importMap,
  log,
}: {
  deno: DenoBridge
  functionPath: string
  importMap: ImportMap
  log: Logger
}) => {
  // The extractor is a Deno script that will import the function and run its
  // `config` export, if one exists.
  const extractorPath = getConfigExtractor()

  // We need to collect the output of the config function, which should be a
  // JSON object. Rather than printing it to stdout, the extractor will write
  // it to a temporary file, which we then read in the Node side. This allows
  // the config function to write to stdout and stderr without that interfering
  // with the extractor.
  const collector = await tmp.file()

  // Retrieving the version of Deno.
  const result = await deno.getBinaryVersion((await deno.getBinaryPath({ silent: true })).path)
  const version = new SemVer(result.version || '')

  // The extractor will use its exit code to signal different error scenarios,
  // based on the list of exit codes we send as an argument. We then capture
  // the exit code to know exactly what happened and guide people accordingly.
  const { exitCode, stderr, stdout } = await deno.run(
    [
      'run',
      '--allow-env',
      version.major >= 2 ? '--allow-import' : '',
      '--allow-net',
      '--allow-read',
      `--allow-write=${collector.path}`,
      `--import-map=${importMap.toDataURL()}`,
      '--no-config',
      '--node-modules-dir=false',
      '--quiet',
      extractorPath,
      pathToFileURL(functionPath).href,
      pathToFileURL(collector.path).href,
      JSON.stringify(ConfigExitCode),
    ].filter(Boolean),
    { rejectOnExitCode: false },
  )

  if (exitCode !== ConfigExitCode.Success) {
    handleConfigError(functionPath, exitCode, stderr, log)

    return {}
  }

  if (stdout !== '') {
    log.user(stdout)
  }

  let collectorData: FunctionConfig = {}

  try {
    const collectorDataJSON = await fs.readFile(collector.path, 'utf8')
    collectorData = JSON.parse(collectorDataJSON) as FunctionConfig
  } catch {
    handleConfigError(functionPath, ConfigExitCode.UnhandledError, stderr, log)
  } finally {
    await collector.cleanup()
  }

  if (!isValidOnError(collectorData.onError)) {
    throw new BundleError(
      new Error(
        `The 'onError' configuration property in edge function at '${functionPath}' must be one of 'fail', 'bypass', or a path starting with '/'. Got '${collectorData.onError}'. More on the Edge Functions API at https://ntl.fyi/edge-api.`,
      ),
    )
  }

  return collectorData
}

const handleConfigError = (functionPath: string, exitCode: number, stderr: string, log: Logger) => {
  let cause: string | Error | undefined

  if (stderr.includes('Import assertions are deprecated')) {
    log.system(`Edge function uses import assertions: ${functionPath}`)

    cause = 'IMPORT_ASSERT'
  }

  switch (exitCode) {
    case ConfigExitCode.ImportError:
      log.user(stderr)

      throw new BundleError(
        new Error(
          `Could not load edge function at '${functionPath}'. More on the Edge Functions API at https://ntl.fyi/edge-api.`,
        ),
        { cause },
      )

    case ConfigExitCode.NoConfig:
      log.system(`No in-source config found for edge function at '${functionPath}'`)

      break

    case ConfigExitCode.InvalidExport:
      throw new BundleError(
        new Error(
          `The 'config' export in edge function at '${functionPath}' must be an object. More on the Edge Functions API at https://ntl.fyi/edge-api.`,
        ),
      )

    case ConfigExitCode.SerializationError:
      throw new BundleError(
        new Error(
          `The 'config' object in the edge function at '${functionPath}' must contain primitive values only. More on the Edge Functions API at https://ntl.fyi/edge-api.`,
        ),
      )
      break

    case ConfigExitCode.InvalidDefaultExport:
      throw new BundleError(
        new Error(
          `Default export in '${functionPath}' must be a function. More on the Edge Functions API at https://ntl.fyi/edge-api.`,
        ),
      )

    default:
      log.user(`Could not load configuration for edge function at '${functionPath}'`)
      log.user(stderr)
  }
}
