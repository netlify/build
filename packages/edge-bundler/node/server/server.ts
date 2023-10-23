import { DenoBridge, OnAfterDownloadHook, OnBeforeDownloadHook, ProcessRef } from '../bridge.js'
import { getFunctionConfig, FunctionConfig } from '../config.js'
import type { EdgeFunction } from '../edge_function.js'
import type { FeatureFlags } from '../feature_flags.js'
import { generateStage2 } from '../formats/javascript.js'
import { ImportMap } from '../import_map.js'
import { getLogger, LogFunction, Logger } from '../logger.js'
import { vendorNPMSpecifiers } from '../npm_dependencies.js'
import { ensureLatestTypes } from '../types.js'

import { killProcess, waitForServer } from './util.js'

export type FormatFunction = (name: string) => string

interface PrepareServerOptions {
  basePath: string
  bootstrapURL: string
  deno: DenoBridge
  distDirectory: string
  distImportMapPath?: string
  entryPoint?: string
  featureFlags?: FeatureFlags
  flags: string[]
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
  importMap: ImportMap
  logger: Logger
  port: number
}

interface StartServerOptions {
  getFunctionsConfig?: boolean
}

const prepareServer = ({
  basePath,
  bootstrapURL,
  deno,
  distDirectory,
  distImportMapPath,
  featureFlags,
  flags: denoFlags,
  formatExportTypeError,
  formatImportError,
  importMap: baseImportMap,
  logger,
  port,
}: PrepareServerOptions) => {
  const processRef: ProcessRef = {}
  const startServer = async (
    functions: EdgeFunction[],
    env: NodeJS.ProcessEnv = {},
    options: StartServerOptions = {},
  ) => {
    if (processRef?.ps !== undefined) {
      await killProcess(processRef.ps)
    }

    let graph

    const stage2Path = await generateStage2({
      bootstrapURL,
      distDirectory,
      fileName: 'dev.js',
      functions,
      formatExportTypeError,
      formatImportError,
    })

    const features: Record<string, boolean> = {}
    const importMap = baseImportMap.clone()
    const npmSpecifiersWithExtraneousFiles: string[] = []

    if (featureFlags?.edge_functions_npm_modules) {
      const vendor = await vendorNPMSpecifiers({
        basePath,
        directory: distDirectory,
        functions: functions.map(({ path }) => path),
        importMap,
        logger,
        referenceTypes: true,
      })

      if (vendor) {
        features.npmModules = true
        importMap.add(vendor.importMap)
        npmSpecifiersWithExtraneousFiles.push(...vendor.npmSpecifiersWithExtraneousFiles)
      }
    }

    try {
      // This command will print a JSON object with all the modules found in
      // the `stage2Path` file as well as all of their dependencies.
      // Consumers such as the CLI can use this information to watch all the
      // relevant files and issue an isolate restart when one of them changes.
      const { stdout } = await deno.run(['info', '--json', stage2Path])

      graph = JSON.parse(stdout)
    } catch {
      // no-op
    }

    const extraDenoFlags = [`--import-map=${importMap.toDataURL()}`]
    const applicationFlags = ['--port', port.toString()]

    // We set `extendEnv: false` to avoid polluting the edge function context
    // with variables from the user's system, since those will not be available
    // in the production environment.
    await deno.runInBackground(['run', ...denoFlags, ...extraDenoFlags, stage2Path, ...applicationFlags], processRef, {
      pipeOutput: true,
      env,
      extendEnv: false,
    })

    let functionsConfig: FunctionConfig[] = []

    if (options.getFunctionsConfig) {
      functionsConfig = await Promise.all(
        functions.map((func) => getFunctionConfig({ func, importMap, deno, log: logger })),
      )
    }

    if (distImportMapPath) {
      await importMap.writeToFile(distImportMapPath)
    }

    const success = await waitForServer(port, processRef.ps)

    return {
      features,
      functionsConfig,
      graph,
      npmSpecifiersWithExtraneousFiles,
      success,
    }
  }

  return startServer
}

interface InspectSettings {
  // Inspect mode enabled
  enabled: boolean

  // Pause on breakpoints (i.e. "--brk")
  pause: boolean

  // Host/port override (optional)
  address?: string
}
interface ServeOptions {
  basePath: string
  bootstrapURL: string
  certificatePath?: string
  debug?: boolean
  distImportMapPath?: string
  featureFlags?: FeatureFlags
  inspectSettings?: InspectSettings
  importMapPaths?: string[]
  onAfterDownload?: OnAfterDownloadHook
  onBeforeDownload?: OnBeforeDownloadHook
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
  port: number
  servePath: string
  userLogger?: LogFunction
  systemLogger?: LogFunction
}

export const serve = async ({
  basePath,
  bootstrapURL,
  certificatePath,
  debug,
  distImportMapPath,
  inspectSettings,
  featureFlags,
  formatExportTypeError,
  formatImportError,
  importMapPaths = [],
  onAfterDownload,
  onBeforeDownload,
  port,
  servePath,
  userLogger,
  systemLogger,
}: ServeOptions) => {
  const logger = getLogger(systemLogger, userLogger, debug)
  const deno = new DenoBridge({
    debug,
    logger,
    onAfterDownload,
    onBeforeDownload,
  })

  // Wait for the binary to be downloaded if needed.
  await deno.getBinaryPath()

  // Downloading latest types if needed.
  await ensureLatestTypes(deno, logger)

  const flags = ['--allow-all', '--no-config']

  if (certificatePath) {
    flags.push(`--cert=${certificatePath}`)
  }

  if (debug) {
    flags.push('--log-level=debug')
  } else {
    flags.push('--quiet')
  }

  if (inspectSettings && inspectSettings.enabled) {
    if (inspectSettings.pause) {
      flags.push(inspectSettings.address ? `--inspect-brk=${inspectSettings.address}` : '--inspect-brk')
    } else {
      flags.push(inspectSettings.address ? `--inspect=${inspectSettings.address}` : '--inspect')
    }
  }

  const importMap = new ImportMap()

  await importMap.addFiles(importMapPaths, logger)

  const server = prepareServer({
    basePath,
    bootstrapURL,
    deno,
    distDirectory: servePath,
    distImportMapPath,
    featureFlags,
    flags,
    formatExportTypeError,
    formatImportError,
    importMap,
    logger,
    port,
  })

  return server
}
