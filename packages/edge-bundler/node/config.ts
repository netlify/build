import { promises as fs } from 'fs'
import { join } from 'path'
import { pathToFileURL } from 'url'

import tmp from 'tmp-promise'

import { DenoBridge } from './bridge.js'
import { BundleError } from './bundle_error.js'
import { EdgeFunction } from './edge_function.js'
import { ImportMap } from './import_map.js'
import { Logger } from './logger.js'
import { getPackagePath } from './package_json.js'

enum ConfigExitCode {
  Success = 0,
  UnhandledError = 1,
  ImportError,
  NoConfig,
  InvalidExport,
  RuntimeError,
  SerializationError,
  InvalidDefaultExport,
}

export const enum Cache {
  Off = 'off',
  Manual = 'manual',
}

export interface FunctionConfig {
  cache?: Cache
  path?: string
}

const getConfigExtractor = () => {
  const packagePath = getPackagePath()
  const configExtractorPath = join(packagePath, 'deno', 'config.ts')

  return configExtractorPath
}

export const getFunctionConfig = async (func: EdgeFunction, importMap: ImportMap, deno: DenoBridge, log: Logger) => {
  // The extractor is a Deno script that will import the function and run its
  // `config` export, if one exists.
  const extractorPath = getConfigExtractor()

  // We need to collect the output of the config function, which should be a
  // JSON object. Rather than printing it to stdout, the extractor will write
  // it to a temporary file, which we then read in the Node side. This allows
  // the config function to write to stdout and stderr without that interfering
  // with the extractor.
  const collector = await tmp.file()

  // The extractor will use its exit code to signal different error scenarios,
  // based on the list of exit codes we send as an argument. We then capture
  // the exit code to know exactly what happened and guide people accordingly.
  const { exitCode, stderr, stdout } = await deno.run(
    [
      'run',
      '--allow-env',
      '--allow-net',
      '--allow-read',
      `--allow-write=${collector.path}`,
      '--quiet',
      `--import-map=${importMap.toDataURL()}`,
      extractorPath,
      pathToFileURL(func.path).href,
      pathToFileURL(collector.path).href,
      JSON.stringify(ConfigExitCode),
    ],
    { rejectOnExitCode: false },
  )

  if (exitCode !== ConfigExitCode.Success) {
    logConfigError(func, exitCode, stderr, log)

    return {}
  }

  if (stdout !== '') {
    log.user(stdout)
  }

  try {
    const collectorData = await fs.readFile(collector.path, 'utf8')

    return JSON.parse(collectorData) as FunctionConfig
  } catch {
    logConfigError(func, ConfigExitCode.UnhandledError, stderr, log)

    return {}
  } finally {
    await collector.cleanup()
  }
}

const logConfigError = (func: EdgeFunction, exitCode: number, stderr: string, log: Logger) => {
  switch (exitCode) {
    case ConfigExitCode.ImportError:
      log.user(`Could not load edge function at '${func.path}'`)
      log.user(stderr)

      break

    case ConfigExitCode.NoConfig:
      log.system(`No in-source config found for edge function at '${func.path}'`)

      break

    case ConfigExitCode.InvalidExport:
      log.user(`'config' export in edge function at '${func.path}' must be a function`)

      break

    case ConfigExitCode.RuntimeError:
      log.user(`Error while running 'config' function in edge function at '${func.path}'`)
      log.user(stderr)

      break

    case ConfigExitCode.SerializationError:
      log.user(`'config' function in edge function at '${func.path}' must return an object with primitive values only`)

      break

    case ConfigExitCode.InvalidDefaultExport:
      throw new BundleError(
        new Error(
          `Default export in '${func.path}' must be a function. More on the Edge Functions API at https://ntl.fyi/edge-api.`,
        ),
      )

    default:
      log.user(`Could not load configuration for edge function at '${func.path}'`)
      log.user(stderr)
  }
}
