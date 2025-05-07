import type { WriteStream } from 'fs'
import { readdir, unlink } from 'fs/promises'
import { join } from 'path'
import { pathToFileURL } from 'url'

import { DenoBridge, OnAfterDownloadHook, OnBeforeDownloadHook, ProcessRef } from '../bridge.js'
import { getFunctionConfig, FunctionConfig } from '../config.js'
import type { EdgeFunction } from '../edge_function.js'
import type { FeatureFlags } from '../feature_flags.js'
import { generateStage2 } from '../formats/javascript.js'
import { ImportMap } from '../import_map.js'
import { getLogger, LogFunction, Logger } from '../logger.js'
import { vendorNPMSpecifiers } from '../npm_dependencies.js'
import { ensureLatestTypes } from '../types.js'
import type { ModuleGraphJson } from '../vendor/module_graph/module_graph.js'

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
  logger: Logger
  stderr?: WriteStream
  stdout?: WriteStream
  port: number
  rootPath?: string
}

interface StartServerOptions {
  getFunctionsConfig?: boolean
  importMapPaths?: string[]
}

/**
 * Cleans up a directory, except for the files specified in the `except` array.
 * Both should be given as absolute paths.
 * Assumes the directory doesn't contain any nested directories.
 */
const cleanDirectory = async (directory: string, except: string[]) => {
  const files = await readdir(directory)
  const toBeDeleted = files.filter((file) => !except.includes(join(directory, file)))
  await Promise.all(toBeDeleted.map((file) => unlink(join(directory, file))))
}

const prepareServer = ({
  basePath,
  bootstrapURL,
  deno,
  distDirectory,
  distImportMapPath,
  flags: denoFlags,
  formatExportTypeError,
  formatImportError,
  logger,
  port,
  rootPath,
  stderr,
  stdout,
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

    let graph: ModuleGraphJson = {
      roots: [],
      modules: [],
      redirects: {},
    }

    const stage2Path = await generateStage2({
      bootstrapURL,
      distDirectory,
      fileName: 'dev.js',
      functions,
      formatExportTypeError,
      formatImportError,
    })

    const features: Record<string, boolean> = {}

    const importMap = new ImportMap()
    await importMap.addFiles(options.importMapPaths ?? [], logger)

    // we keep track of the files that are relevant to the user's code, so we can clean up leftovers from past executions later
    const relevantFiles = [stage2Path]

    const vendor = await vendorNPMSpecifiers({
      basePath,
      directory: distDirectory,
      functions: functions.map(({ path }) => path),
      importMap,
      logger,
      environment: 'development',
      rootPath,
    })

    if (vendor) {
      features.npmModules = true
      importMap.add(vendor.importMap)
      relevantFiles.push(...vendor.outputFiles)
    }

    await cleanDirectory(distDirectory, relevantFiles)

    try {
      // This command will print a JSON object with all the modules found in
      // the `stage2Path` file as well as all of their dependencies.
      // Consumers such as the CLI can use this information to watch all the
      // relevant files and issue an isolate restart when one of them changes.
      const { stdout } = await deno.run(['info', '--json', pathToFileURL(stage2Path).href])

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
      env,
      extendEnv: false,
      pipeOutput: true,
      stderr,
      stdout,
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
  onAfterDownload?: OnAfterDownloadHook
  onBeforeDownload?: OnBeforeDownloadHook
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
  port: number
  rootPath?: string
  servePath: string
  stderr?: WriteStream
  stdout?: WriteStream
  userLogger?: LogFunction
  systemLogger?: LogFunction
}

export const serve = async ({
  /**
   * Path that is common to all functions. Works as the root directory in the
   * generated bundle.
   */
  basePath,

  /**
   * URL of the bootstrap layer to use.
   */
  bootstrapURL,

  /**
   * Path to an SSL certificate to run the Deno server with.
   */
  certificatePath,

  /**
   * Whether to print verbose information about the server process.
   */
  debug,

  /**
   * Path of an import map file to be generated using the built-in specifiers
   * and any npm modules found during the bundling process.
   */
  distImportMapPath,

  /**
   * Debug settings to use with Deno's `--inspect` and `--inspect-brk` flags.
   */
  inspectSettings,

  /**
   * Map of feature flags.
   */
  featureFlags,

  /**
   * Callback function to be triggered whenever a function has a default export
   * with the wrong type.
   */
  formatExportTypeError,

  /**
   * Callback function to be triggered whenever an error occurs while importing
   * a function.
   */
  formatImportError,

  /**
   * Callback function to be triggered after the Deno CLI has been downloaded.
   */
  onAfterDownload,

  /**
   * Callback function to be triggered before we attempt to download the Deno
   * CLI.
   */
  onBeforeDownload,

  /**
   * Port where the server should listen on.
   */
  port,

  /**
   * Root path of the project. Defines a boundary outside of which files or npm
   * modules cannot be included from. This is usually the same as `basePath`,
   * with monorepos being the main exception, where `basePath` maps to the
   * package path and `rootPath` is the repository root.
   */
  rootPath,

  /**
   * Path to write ephemeral files that need to be generated for the server to
   * operate.
   */
  servePath,

  /**
   * Writable stream to receive the stderr of the server process. If not set,
   * the stderr of the parent process will be used.
   */
  stderr,

  /**
   * Writable stream to receive the stdout of the server process. If not set,
   * the stdout of the parent process will be used.
   */
  stdout,

  /**
   * Custom logging function to be used for user-facing messages. Defaults to
   * `console.log`.
   */
  userLogger,

  /**
   * Custom logging function to be used for system-level messages.
   */
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
    logger,
    stderr,
    stdout,
    port,
    rootPath,
  })

  return server
}
