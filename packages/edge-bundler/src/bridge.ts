import { promises as fs } from 'fs'
import path from 'path'
import process from 'process'

import { execa } from 'execa'
import semver from 'semver'

import { download } from './downloader.js'
import { getPathInHome } from './home_path.js'
import { getBinaryExtension } from './platform.js'

const DENO_VERSION_FILE = 'version.txt'
const DENO_VERSION_RANGE = '^1.19.0'

type LifecycleHook = () => void | Promise<void>

interface DenoOptions {
  cacheDirectory?: string
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
  useGlobal?: boolean
  versionRange?: string
}

class DenoBridge {
  cacheDirectory: string
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
  useGlobal: boolean
  versionRange: string

  constructor(options: DenoOptions = {}) {
    this.cacheDirectory = options.cacheDirectory ?? getPathInHome('deno-cli')
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

    const binaryPath = await download(this.cacheDirectory)
    const version = await DenoBridge.getBinaryVersion(binaryPath)

    if (version === undefined) {
      throw new Error('Could not read downloaded binary')
    }

    await this.writeVersionFile(version)

    if (this.onAfterDownload) {
      this.onAfterDownload()
    }

    return binaryPath
  }

  private async writeVersionFile(version: string) {
    const versionFilePath = path.join(this.cacheDirectory, DENO_VERSION_FILE)

    await fs.writeFile(versionFilePath, version)
  }

  async getBinaryPath(): Promise<string> {
    const globalPath = await this.getGlobalBinary()

    if (globalPath !== undefined) {
      return globalPath
    }

    const cachedPath = await this.getCachedBinary()

    if (cachedPath !== undefined) {
      return cachedPath
    }

    return this.getRemoteBinary()
  }

  async run(args: string[], { wait = true }: { wait?: boolean } = {}) {
    const binaryPath = await this.getBinaryPath()
    const runDeno = execa(binaryPath, args)

    runDeno.stdout?.pipe(process.stdout)
    runDeno.stderr?.pipe(process.stderr)

    if (!wait) {
      return runDeno
    }

    return await runDeno
  }
}

export { DenoBridge }
export type { LifecycleHook }
