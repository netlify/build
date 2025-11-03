import { promises as fs, type WriteStream } from 'fs'
import path from 'path'
import process from 'process'

import { execa, type ExecaChildProcess, type Options } from 'execa'
import pathKey from 'path-key'
import semver from 'semver'

import { download } from './downloader.js'
import { FeatureFlags } from './feature_flags.js'
import { getPathInHome } from './home_path.js'
import { getLogger, Logger } from './logger.js'
import { getBinaryExtension } from './platform.js'

const DENO_VERSION_FILE = 'version.txt'

export const LEGACY_DENO_VERSION_RANGE = '1.39.0 - 2.2.4'

// When updating DENO_VERSION_RANGE, ensure that the deno version
// on the netlify/buildbot build image satisfies this range!
// https://github.com/netlify/buildbot/blob/f9c03c9dcb091d6570e9d0778381560d469e78ad/build-image/noble/Dockerfile#L410
export const DENO_VERSION_RANGE = '^2.4.2'

export type OnBeforeDownloadHook = () => void | Promise<void>
export type OnAfterDownloadHook = (error?: Error) => void | Promise<void>

export interface DenoOptions {
  cacheDirectory?: string
  debug?: boolean
  denoDir?: string
  featureFlags?: FeatureFlags
  logger?: Logger
  onAfterDownload?: OnAfterDownloadHook
  onBeforeDownload?: OnBeforeDownloadHook
  useGlobal?: boolean
  versionRange?: string
}

export interface ProcessRef {
  ps?: ExecaChildProcess<string>
}

interface RunOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
  extendEnv?: boolean
  pipeOutput?: boolean
  stderr?: WriteStream
  stdout?: WriteStream
  rejectOnExitCode?: boolean
}

export class DenoBridge {
  cacheDirectory: string
  currentDownload?: ReturnType<DenoBridge['downloadBinary']>
  debug: boolean
  denoDir?: string
  logger: Logger
  onAfterDownload?: OnAfterDownloadHook
  onBeforeDownload?: OnBeforeDownloadHook
  useGlobal: boolean
  versionRange: string

  constructor(options: DenoOptions) {
    this.cacheDirectory = options.cacheDirectory ?? getPathInHome('deno-cli')
    this.debug = options.debug ?? false
    this.denoDir = options.denoDir
    this.logger = options.logger ?? getLogger(undefined, undefined, options.debug)
    this.onAfterDownload = options.onAfterDownload
    this.onBeforeDownload = options.onBeforeDownload
    this.useGlobal = options.useGlobal ?? true
    this.versionRange = options.versionRange ?? DENO_VERSION_RANGE
  }

  private async downloadBinary() {
    await this.onBeforeDownload?.()

    await this.ensureCacheDirectory()

    this.logger.system(`Downloading Deno CLI to ${this.cacheDirectory}`)

    const binaryPath = await download(this.cacheDirectory, this.versionRange, this.logger)
    const result = await this.getBinaryVersion(binaryPath)

    // If we can't execute the downloaded binary, provide actionable info to diagnose and self-heal if possible
    if (result.error) {
      const error = new Error(
        `Failed to set up Deno for Edge Functions.
Error: ${result.error.message}
Downloaded to: ${binaryPath}
Platform: ${process.platform}/${process.arch}

This may be caused by permissions, antivirus software, or platform incompatibility.

Try clearing the Deno cache directory and retrying:
  ${this.cacheDirectory}

Supported Deno versions: ${this.versionRange}

To install Deno manually: https://ntl.fyi/install-deno`,
      )

      await this.onAfterDownload?.(error)

      this.logger.system('Could not run downloaded Deno CLI', error)

      throw error
    }

    await this.writeVersionFile(result.version)

    await this.onAfterDownload?.()

    return binaryPath
  }

  async getBinaryVersion(
    binaryPath: string,
  ): Promise<{ version: string; error?: undefined } | { version?: undefined; error: Error }> {
    try {
      const { stdout } = await execa(binaryPath, ['--version'])
      const version = stdout.match(/^deno ([\d.]+)/)

      if (!version) {
        this.logger.system(`getBinaryVersion no version found. binaryPath ${binaryPath}`)
        return { error: new Error('Could not parse Deno version from output') }
      }

      return { version: version[1] }
    } catch (error) {
      this.logger.system('getBinaryVersion failed', error)
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  private async getCachedBinary() {
    const versionFilePath = path.join(this.cacheDirectory, DENO_VERSION_FILE)

    let cachedVersion

    try {
      cachedVersion = await fs.readFile(versionFilePath, 'utf8')
    } catch (error) {
      this.logger.system('Error getting cached binary', error)
      return
    }

    if (!semver.satisfies(cachedVersion, this.versionRange)) {
      this.logger.system(`semver not satisfied. cachedVersion: ${cachedVersion}, versionRange: ${this.versionRange}`)
      return
    }

    const binaryName = `deno${getBinaryExtension()}`

    return path.join(this.cacheDirectory, binaryName)
  }

  private async getGlobalBinary() {
    if (!this.useGlobal) {
      return
    }

    const globalBinaryName = 'deno'
    const result = await this.getBinaryVersion(globalBinaryName)

    if (result.error || !semver.satisfies(result.version, this.versionRange)) {
      this.logger.system(
        `No globalVersion or semver not satisfied. globalVersion: ${result.version}, versionRange: ${this.versionRange}`,
      )
      return
    }

    return globalBinaryName
  }

  private getRemoteBinary() {
    if (this.currentDownload === undefined) {
      this.currentDownload = this.downloadBinary()
    }

    return this.currentDownload
  }

  private static runWithBinary(
    binaryPath: string,
    args: string[],
    {
      options,
      pipeOutput,
      stderr,
      stdout,
    }: { options?: Options; pipeOutput?: boolean; stderr?: WriteStream; stdout?: WriteStream },
  ) {
    const runDeno = execa(binaryPath, args, options)

    if (stderr) {
      runDeno.stderr?.pipe(stderr)
    } else if (pipeOutput) {
      runDeno.stderr?.pipe(process.stderr)
    }

    if (stdout) {
      runDeno.stdout?.pipe(stdout)
    } else if (pipeOutput) {
      runDeno.stdout?.pipe(process.stdout)
    }

    return runDeno
  }

  private async writeVersionFile(version: string) {
    await this.ensureCacheDirectory()

    const versionFilePath = path.join(this.cacheDirectory, DENO_VERSION_FILE)

    await fs.writeFile(versionFilePath, version)
  }

  async ensureCacheDirectory() {
    await fs.mkdir(this.cacheDirectory, { recursive: true })
  }

  async getBinaryPath(options?: { silent?: boolean }) {
    const globalPath = await this.getGlobalBinary()

    if (globalPath !== undefined) {
      if (!options?.silent) {
        this.logger.system('Using global installation of Deno CLI')
      }

      return { global: true, path: globalPath }
    }

    const cachedPath = await this.getCachedBinary()

    if (cachedPath !== undefined) {
      if (!options?.silent) {
        this.logger.system('Using cached Deno CLI from', cachedPath)
      }

      return { global: false, path: cachedPath }
    }

    const downloadedPath = await this.getRemoteBinary()

    return { global: false, path: downloadedPath }
  }

  getEnvironmentVariables(inputEnv: NodeJS.ProcessEnv = {}) {
    const env: NodeJS.ProcessEnv = { ...inputEnv }

    if (this.denoDir !== undefined) {
      env.DENO_DIR = this.denoDir
    }

    // Ensure PATH is always set as otherwise we are not able to find the global deno binary
    env[pathKey()] = inputEnv[pathKey({ env: inputEnv })] || process.env[pathKey()]

    return env
  }

  // Runs the Deno CLI in the background and returns a reference to the child
  // process, awaiting its execution.
  async run(
    args: string[],
    { cwd, env: inputEnv, extendEnv = true, rejectOnExitCode = true, stderr, stdout }: RunOptions = {},
  ) {
    const { path: binaryPath } = await this.getBinaryPath()
    const env = this.getEnvironmentVariables(inputEnv)
    const options: Options = { cwd, env, extendEnv, reject: rejectOnExitCode }

    return DenoBridge.runWithBinary(binaryPath, args, { options, stderr, stdout })
  }

  // Runs the Deno CLI in the background, assigning a reference of the child
  // process to a `ps` property in the `ref` argument, if one is supplied.
  async runInBackground(
    args: string[],
    ref?: ProcessRef,
    { env: inputEnv, extendEnv = true, pipeOutput, stderr, stdout }: RunOptions = {},
  ) {
    const { path: binaryPath } = await this.getBinaryPath()
    const env = this.getEnvironmentVariables(inputEnv)
    const options: Options = { env, extendEnv }
    const ps = DenoBridge.runWithBinary(binaryPath, args, { options, pipeOutput, stderr, stdout })

    if (ref !== undefined) {
      ref.ps = ps
    }
  }
}
