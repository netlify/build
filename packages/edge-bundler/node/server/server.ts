import { tmpName } from 'tmp-promise'

import { DenoBridge, OnAfterDownloadHook, OnBeforeDownloadHook, ProcessRef } from '../bridge.js'
import { getFunctionConfig, FunctionConfig } from '../config.js'
import type { EdgeFunction } from '../edge_function.js'
import { generateStage2 } from '../formats/javascript.js'
import { ImportMap } from '../import_map.js'
import { getLogger, LogFunction, Logger } from '../logger.js'
import { ensureLatestTypes } from '../types.js'

import { killProcess, waitForServer } from './util.js'

type FormatFunction = (name: string) => string

interface PrepareServerOptions {
  bootstrapURL: string
  deno: DenoBridge
  distDirectory: string
  entryPoint?: string
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
  bootstrapURL,
  deno,
  distDirectory,
  flags: denoFlags,
  formatExportTypeError,
  formatImportError,
  importMap,
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

    const bootstrapFlags = ['--port', port.toString()]

    // We set `extendEnv: false` to avoid polluting the edge function context
    // with variables from the user's system, since those will not be available
    // in the production environment.
    await deno.runInBackground(['run', ...denoFlags, stage2Path, ...bootstrapFlags], processRef, {
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

    const success = await waitForServer(port, processRef.ps)

    return {
      functionsConfig,
      graph,
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
  bootstrapURL: string
  certificatePath?: string
  debug?: boolean
  distImportMapPath?: string
  inspectSettings?: InspectSettings
  importMapPaths?: string[]
  onAfterDownload?: OnAfterDownloadHook
  onBeforeDownload?: OnBeforeDownloadHook
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
  port: number
  systemLogger?: LogFunction
}

const serve = async ({
  bootstrapURL,
  certificatePath,
  debug,
  distImportMapPath,
  inspectSettings,
  formatExportTypeError,
  formatImportError,
  importMapPaths = [],
  onAfterDownload,
  onBeforeDownload,
  port,
  systemLogger,
}: ServeOptions) => {
  const logger = getLogger(systemLogger, debug)
  const deno = new DenoBridge({
    debug,
    logger,
    onAfterDownload,
    onBeforeDownload,
  })

  // We need to generate a stage 2 file and write it somewhere. We use a
  // temporary directory for that.
  const distDirectory = await tmpName()

  // Wait for the binary to be downloaded if needed.
  await deno.getBinaryPath()

  // Downloading latest types if needed.
  await ensureLatestTypes(deno, logger)

  const importMap = new ImportMap()

  await importMap.addFiles(importMapPaths, logger)

  const flags = ['--allow-all', `--import-map=${importMap.toDataURL()}`, '--no-config']

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

  const server = prepareServer({
    bootstrapURL,
    deno,
    distDirectory,
    flags,
    formatExportTypeError,
    formatImportError,
    importMap,
    logger,
    port,
  })

  if (distImportMapPath) {
    await importMap.writeToFile(distImportMapPath)
  }

  return server
}

export { serve }
export type { FormatFunction }
