import { existsSync } from 'fs'
import { createRequire } from 'module'
import { normalize, delimiter } from 'path'
import { env } from 'process'
import { fileURLToPath } from 'url'

import test from 'ava'
import cpy from 'cpy'
import { execa, execaCommand } from 'execa'
import stringify from 'fast-safe-stringify'
import { getBinPathSync } from 'get-bin-path'
import isPlainObj from 'is-plain-obj'
import { merge } from 'lodash-es'
import pathKey from 'path-key'

import { createRepoDir, removeDir } from './dir.js'
import { ServerHandler, startServer, Request } from './server.js'

const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url))

const BUILD_BIN_DIR = normalize(`${ROOT_DIR}/node_modules/.bin`)

const require = createRequire(import.meta.url)

export class Fixture {
  flags: Record<string, unknown> = {
    buffer: true,
    featureFlags: {},
  }

  /** list of flags that are used for @netlify/config for testing */
  configFlags = {
    stable: true,
    branch: 'branch',
  }

  /** list of flags that are used for @netlify/build for testing */
  buildFlags = {
    debug: true,
    testOpts: {
      silentLingeringProcesses: true,
      pluginsListUrl: 'test',
    },
  }

  /** flags set by `withFlags` */
  private additionalFlags: Record<string, unknown> = {}

  env = {
    // Ensure local environment variables aren't used during development
    NETLIFY_AUTH_TOKEN: '',
  }

  // TODO: check if needed
  buildEnv: Record<string, string> = {
    BUILD_TELEMETRY_DISABLED: '',
    // Allows executing any locally installed Node modules inside tests,
    // regardless of the current directory.
    // This is needed for example to run `yarn` in tests in environments that
    // do not have a global binary of `yarn`.
    [pathKey()]: `${env[pathKey()]}${delimiter}${BUILD_BIN_DIR}`,
  }

  copyRootDir: string
  /** The absolute path of the fixtures repository root */
  repositoryRoot = ''

  /** The binary of @netlify/build */
  private buildBinaryPath = getBinPathSync({ cwd: require.resolve('@netlify/build') })
  private configBinaryPath = getBinPathSync({ cwd: require.resolve('@netlify/config') })

  getConfigFlags(): Record<string, unknown> {
    return {
      ...this.flags,
      ...this.configFlags,
      ...this.additionalFlags,
      env: this.env,
    }
  }

  getBuildFlags(): Record<string, unknown> {
    const { testOpts, ...rest } = this.additionalFlags
    const flags = { ...this.flags, ...this.buildFlags, ...rest, env: { ...this.buildEnv, ...this.env } }

    if (typeof testOpts === 'object') {
      flags.testOpts = {
        ...flags.testOpts,
        ...testOpts,
      }
    }

    return flags
  }

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
  withEnv(environment: Record<string, string> = {}): this {
    this.env = { ...this.env, ...environment }
    return this
  }

  /** Adds flags that are used for the execution  */
  withFlags(flags: Record<string, unknown> = {}): this {
    this.additionalFlags = merge({}, this.additionalFlags, flags)
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
  async runConfigBinaryAsObject(): Promise<object> {
    const { output } = await this.runConfigBinary()
    return JSON.parse(output)
  }

  /** Runs a fixture using `@netlify/config` instead of executing the binary */
  async runWithConfig(): Promise<string> {
    const { resolveConfig } = await import('@netlify/config')
    try {
      const { logs: { stdout = [], stderr = [] } = {}, api, ...result } = await resolveConfig(this.getConfigFlags())
      const resultA = api === undefined ? result : { ...result, hasApi: true }
      const resultB = stringify.default.stableStringify(resultA, null, 2)
      return [stdout.join('\n'), stderr.join('\n'), resultB].filter(Boolean).join('\n\n')
    } catch (error) {
      return errorToString(error)
    } finally {
      await this.cleanup()
    }
  }

  /** Runs @netlify/build main function programmatic with the provided flags  */
  async runBuildProgrammatic(): Promise<object> {
    const { default: build } = await import('@netlify/build')
    return await build(this.getBuildFlags())
  }

  async runWithBuild(): Promise<string> {
    const { default: build } = await import('@netlify/build')
    const { logs } = await build(this.getBuildFlags())
    return [logs.stdout.join('\n'), logs.stderr.join('\n')].filter(Boolean).join('\n\n')
  }

  // TODO: provide better typing if we know what's possible
  async runDev(devCommand: unknown): Promise<string> {
    const { startDev } = await import('@netlify/build')
    const entryPoint = startDev.bind(null, devCommand)
    const { logs } = await entryPoint(this.getBuildFlags())
    return [logs.stdout.join('\n'), logs.stderr.join('\n')].filter(Boolean).join('\n\n')
  }

  runConfigBinary(cwd?: string) {
    return this.runBinary(this.configBinaryPath, cwd, this.getConfigFlags())
  }

  runBuildBinary(cwd?: string) {
    return this.runBinary(this.buildBinaryPath, cwd, this.getBuildFlags())
  }

  private async runBinary(
    binary: string,
    cwd?: string,
    flags: Record<string, unknown> = {},
  ): Promise<{
    output: string
    exitCode: number
  }> {
    const { env: environment, ...remainingFlags } = flags
    try {
      const cliFlags = getCliFlags(remainingFlags)
      const { all: output, exitCode } = await execa(binary, cliFlags, {
        all: true,
        reject: false,
        env: (environment as Record<string, string>) || {},
        cwd,
      })
      return { output, exitCode }
    } finally {
      await this.cleanup()
    }
  }

  /** Run the @netlify/build wrapped with a server and and the provided handler */
  runBuildServer(handler: ServerHandler): Promise<{ output: string; requests: Request[] }> {
    return this.runServer(this.runWithBuild, handler)
  }

  /** Run the @netlify/config wrapped with a server and and the provided handler */
  runConfigServer(handler: ServerHandler): Promise<{ output: string; requests: Request[] }> {
    return this.runServer(this.runWithConfig, handler)
  }

  /** Returns a JSON.parsed output of the runConfigServer function */
  async runConfigServerAsObject(handler: ServerHandler): Promise<object> {
    const { output } = await this.runConfigServer(handler)
    return JSON.parse(output)
  }

  /** Runs a server and stops it with the provided function and the handler */
  private async runServer(
    fn: () => Promise<string>,
    handler: ServerHandler,
  ): Promise<{ output: string; requests: Request[] }> {
    const { scheme, host, requests, stopServer } = await startServer(handler)
    try {
      this.withFlags({ testOpts: { scheme, host } })
      const output = await fn.bind(this)()
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
