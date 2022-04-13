import { promises as fs } from 'fs'
import path from 'path'
import process from 'process'

import { execa, ExecaChildProcess } from 'execa'
import semver from 'semver'

import { download } from './downloader.js'
import { getPathInHome } from './home_path.js'
import { getBinaryExtension } from './platform.js'

const DENO_VERSION_FILE = 'version.txt'
const DENO_VERSION_RANGE = '^1.20.3'

type LifecycleHook = () => void | Promise<void>

interface DenoOptions {
  cacheDirectory?: string
  debug?: boolean
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
  useGlobal?: boolean
  versionRange?: string
}

interface ProcessRef {
  ps?: ExecaChildProcess<string>
}

interface RunOptions {
  pipeOutput?: boolean
}

class DenoBridge {
  cacheDirectory: string
  debug: boolean
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
  useGlobal: boolean
  versionRange: string

  constructor(options: DenoOptions = {}) {
    this.cacheDirectory = options.cacheDirectory ?? getPathInHome('deno-cli')
    this.debug = options.debug ?? false
    this.onAfterDownload = options.onAfterDownload
    this.onBeforeDownload = options.onBeforeDownload
    this.useGlobal = options.useGlobal ?? true
    this.versionRange = options.versionRange ?? DENO_VERSION_RANGE
  }

  static async getBinaryVersion(binaryPath: string) {
    try {
      const { stdout } = await execa(binaryPath, ['--version'])
      const version = stdout.match(/^deno ([\d.]+)/)

      if (!version) {
        return
      }

      return version[1]
    } catch {
      // no-op
    }
  }

  private async getCachedBinary() {
    const versionFilePath = path.join(this.cacheDirectory, DENO_VERSION_FILE)

    let cachedVersion

    try {
      cachedVersion = await fs.readFile(versionFilePath, 'utf8')
    } catch {
      return
    }

    if (!semver.satisfies(cachedVersion, this.versionRange)) {
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
    const globalVersion = await DenoBridge.getBinaryVersion(globalBinaryName)

    if (globalVersion === undefined || !semver.satisfies(globalVersion, this.versionRange)) {
      return
    }

    return globalBinaryName
  }

  private async getRemoteBinary() {
    if (this.onBeforeDownload) {
      this.onBeforeDownload()
    }

    await fs.mkdir(this.cacheDirectory, { recursive: true })

    const binaryPath = await download(this.cacheDirectory, this.versionRange)
    const downloadedVersion = await DenoBridge.getBinaryVersion(binaryPath)

    // We should never get here, because it means that `DENO_VERSION_RANGE` is
    // a malformed semver range. If this does happen, let's throw an error so
    // that the tests catch it.
    if (downloadedVersion === undefined) {
      throw new Error('Could not read downloaded binary')
    }

    await this.writeVersionFile(downloadedVersion)

    if (this.onAfterDownload) {
      this.onAfterDownload()
    }

    return binaryPath
  }

  private log(...data: unknown[]) {
    if (!this.debug) {
      return
    }

    console.log(...data)
  }

  private static runWithBinary(binaryPath: string, args: string[], pipeOutput?: boolean) {
    const runDeno = execa(binaryPath, args)

    if (pipeOutput) {
      runDeno.stdout?.pipe(process.stdout)
      runDeno.stderr?.pipe(process.stderr)
    }

    return runDeno
  }

  private async writeVersionFile(version: string) {
    const versionFilePath = path.join(this.cacheDirectory, DENO_VERSION_FILE)

    await fs.writeFile(versionFilePath, version)
  }

  async getBinaryPath() {
    const globalPath = await this.getGlobalBinary()

    if (globalPath !== undefined) {
      this.log('Using global installation of Deno CLI')

      return { global: true, path: globalPath }
    }

    const cachedPath = await this.getCachedBinary()

    if (cachedPath !== undefined) {
      this.log('Using cached Deno CLI from', cachedPath)

      return { global: false, path: cachedPath }
    }

    this.log('Downloading Deno CLI...')

    const downloadedPath = await this.getRemoteBinary()

    return { global: false, path: downloadedPath }
  }

  // Runs the Deno CLI in the background and returns a reference to the child
  // process, awaiting its execution.
  async run(args: string[], { pipeOutput }: RunOptions = {}) {
    const { path: binaryPath } = await this.getBinaryPath()

    return DenoBridge.runWithBinary(binaryPath, args, pipeOutput)
  }

  // Runs the Deno CLI in the background, assigning a reference of the child
  // process to a `ps` property in the `ref` argument, if one is supplied.
  async runInBackground(args: string[], pipeOutput?: boolean, ref?: ProcessRef) {
    const { path: binaryPath } = await this.getBinaryPath()
    const ps = DenoBridge.runWithBinary(binaryPath, args, pipeOutput)

    if (ref !== undefined) {
      // eslint-disable-next-line no-param-reassign
      ref.ps = ps
    }
  }
}

export { DenoBridge }
export type { LifecycleHook, ProcessRef }
