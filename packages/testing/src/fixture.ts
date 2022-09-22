import { existsSync } from 'fs'
import { createRequire } from 'module'
import { normalize } from 'path'
import { fileURLToPath } from 'url'

import test from 'ava'
import cpy from 'cpy'
import { execa, execaCommand } from 'execa'
import stringify from 'fast-safe-stringify'
import { getBinPathSync } from 'get-bin-path'
import isPlainObj from 'is-plain-obj'

import { createRepoDir, removeDir } from './dir.js'
import { ServerHandler, startServer, Request } from './server.js'

const require = createRequire(import.meta.url)

export class Fixture {
  flags: Record<string, unknown> = {
    stable: true,
    buffer: true,
    branch: 'branch',
    featureFlags: {},
  }

  env = {
    // Ensure local environment variables aren't used during development
    // TODO: check this one
    // BUILD_TELEMETRY_DISABLED: '',
    NETLIFY_AUTH_TOKEN: '',
  }

  copyRootDir: string
  /** The absolute path of the fixtures repository root */
  repositoryRoot = ''

  /** The binary of @netlify/build */
  private buildBinaryPath = getBinPathSync({ cwd: require.resolve('@netlify/build') })
  private configBinaryPath = getBinPathSync({ cwd: require.resolve('@netlify/config') })

  constructor(
    /**
     * a relative path from the test file to the fixture directory
     * @example: ./fixtures/my_fixture
     */
    relativeFixturePath?: string,
  ) {
    if (relativeFixturePath && relativeFixturePath.length !== 0) {
      const testFile = fileURLToPath(test.meta.file)
      this.repositoryRoot = normalize(`${testFile}/../${relativeFixturePath}`)

      if (!existsSync(this.repositoryRoot)) {
        throw new Error(`The provided fixtures path does not exist: ${this.repositoryRoot}`)
      }

      this.flags.repositoryRoot = this.repositoryRoot
    }
  }

  /** Adds environment variables that are used for the execution  */
  withEnv(env: Record<string, string> = {}): this {
    this.env = { ...this.env, ...env }
    return this
  }

  /** Adds flags that are used for the execution  */
  withFlags(flags: Record<string, unknown> = {}): this {
    this.flags = { ...this.flags, ...flags }
    return this
  }

  async withCopyRoot(copyRoot: object & { cwd?: boolean; git?: boolean; branch?: string } = {}): Promise<this> {
    this.copyRootDir = normalize(createRepoDir(copyRoot.git))
    await cpy('**', this.copyRootDir, { cwd: this.repositoryRoot, parents: true })

    if (copyRoot.branch !== undefined) {
      await execaCommand(`git checkout -b ${copyRoot.branch}`, { cwd: this.copyRootDir })
    }

    this.repositoryRoot = this.copyRootDir

    if (copyRoot.cwd) {
      delete this.flags.repositoryRoot
      this.flags.cwd = this.copyRootDir
    } else {
      this.flags.repositoryRoot = this.copyRootDir
    }

    return this
  }

  /** Returns a JSON.parsed output of the runWithConfig function */
  async runWithConfigAsObject(): Promise<object> {
    const output = await this.runWithConfig()
    return JSON.parse(output)
  }

  /** Returns a JSON.parsed output of the runBinary function */
  async runBinaryAsObject(): Promise<object> {
    const { output } = await this.runBinary()
    return JSON.parse(output)
  }

  /** Returns a JSON.parsed output of the runServer function */
  async runServerAsObject(handler: ServerHandler): Promise<object> {
    const { output } = await this.runServer(handler)
    return JSON.parse(output)
  }

  /** Runs a fixture using `@netlify/config` instead of executing the binary */
  async runWithConfig(): Promise<string> {
    const { resolveConfig } = await import('@netlify/config')
    try {
      const {
        logs: { stdout = [], stderr = [] } = {},
        api,
        ...result
      } = await resolveConfig({ ...this.flags, env: this.env })
      const resultA = api === undefined ? result : { ...result, hasApi: true }
      const resultB = stringify.default.stableStringify(resultA, null, 2)
      return [stdout.join('\n'), stderr.join('\n'), resultB].filter(Boolean).join('\n\n')
    } catch (error) {
      return errorToString(error)
    } finally {
      await this.cleanup()
    }
  }

  async runBinary(cwd?: string) {
    try {
      const cliFlags = getCliFlags(this.flags)
      const { all: output, exitCode } = await execa(this.configBinaryPath, cliFlags, {
        all: true,
        reject: false,
        env: this.env,
        cwd,
      })
      return { output, exitCode }
    } finally {
      await this.cleanup()
    }
  }

  async runServer(handler: ServerHandler): Promise<{ output: string; requests: Request[] }> {
    const { scheme, host, requests, stopServer } = await startServer(handler)
    try {
      this.withFlags({ testOpts: { scheme, host } })
      const output = await this.runWithConfig()
      return { output, requests }
    } finally {
      await stopServer()
    }
  }

  /** Removes the copyRootDir if it was created */
  private async cleanup() {
    if (this.copyRootDir && this.copyRootDir.length !== 0) {
      await removeDir(this.copyRootDir)
    }
  }
}

const getCliFlags = (mainFlags: Record<string, unknown>, prefix: string[] = []) =>
  Object.entries(mainFlags).flatMap(([name, value]) => getCliFlag(name, value, prefix))

const getCliFlag = (name: string, value: unknown, prefix: string[]) => {
  if (name === 'featureFlags') {
    const val = Object.entries(value)
      .filter(([, enabled]) => enabled)
      .join(',')
    return [`--${name}=${val}`]
  }

  if (isPlainObj(value)) {
    return getCliFlags(value, [...prefix, name])
  }

  const key = [...prefix, name].join('.')

  if (value === false) {
    return [`--no-${key}`]
  }

  return [`--${key}=${value}`]
}

/** Get's the errors message as string */
const errorToString = (error: unknown): string => (error instanceof Error ? error.message : `${error}`)
