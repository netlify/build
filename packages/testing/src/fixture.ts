import { existsSync } from 'fs'
import { createRequire } from 'module'
import { normalize, delimiter } from 'path'
import { env } from 'process'
import { fileURLToPath } from 'url'

import { default as build, startDev } from '@netlify/build'
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

// TODO: this type should be moved to @netlify/build and @netlify/config as it's the main argument of the entry point
type Flags = {
  [key: string]: unknown
  buffer?: boolean
  featureFlags?: Record<string, boolean>
  env: NodeJS.ProcessEnv
}

export class Fixture {
  flags: Partial<Flags> = {
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

  getConfigFlags(): Flags {
    return {
      ...this.flags,
      ...this.configFlags,
      ...this.additionalFlags,
      env: this.env,
    }
  }

  getBuildFlags(): Flags {
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

  /**
   * environment variables passed to child processes.
   * To set environment variables in the parent process
   */
  withEnv(environment: Record<string, string> = {}): this {
    this.env = { ...this.env, ...environment }
    return this
  }

  /** any flags/options passed to the main command  */
  withFlags(flags: Record<string, unknown> = {}): this {
    this.additionalFlags = merge({}, this.additionalFlags, flags)
    return this
  }

  /**
   * copy the fixture directory to a temporary directory.
   * This is useful when no parent directory should have a `.git` or `package.json`.
   */
  async withCopyRoot(
    copyRoot: {
      cwd?: boolean
      /** whether the copied directory should have a `.git`. Default: `true` */
      git?: boolean
      /** create a git branch after copy */
      branch?: string
    } = { git: true },
  ): Promise<this> {
    this.copyRootDir = normalize(createRepoDir(copyRoot.git))
    await cpy('./**', this.copyRootDir, { cwd: this.repositoryRoot })

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
      const resultB = stringify.default.stableStringify(resultA, undefined, 2)
      return [stdout.join('\n'), stderr.join('\n'), resultB].filter(Boolean).join('\n\n')
    } catch (error) {
      return errorToString(error)
    } finally {
      await this.cleanup()
    }
  }

  /** Runs @netlify/build main function programmatic with the provided flags  */
  async runBuildProgrammatic(): Promise<object> {
    return await build(this.getBuildFlags())
  }

  async runWithBuild(): Promise<string> {
    const { output } = await this.runWithBuildAndIntrospect()
    return output
  }

  async runWithBuildAndIntrospect(): Promise<Awaited<ReturnType<typeof build>> & { output: string }> {
    const buildResult = await build(this.getBuildFlags())
    const output = [buildResult.logs?.stdout.join('\n'), buildResult.logs?.stderr.join('\n')]
      .filter(Boolean)
      .join('\n\n')

    return {
      ...buildResult,
      output,
    }
  }

  // TODO: provide better typing if we know what's possible
  async runDev(devCommand: unknown): Promise<string> {
    const entryPoint = startDev.bind(null, devCommand)
    const { logs } = await entryPoint(this.getBuildFlags())
    return [logs?.stdout.join('\n'), logs?.stderr.join('\n')].filter(Boolean).join('\n\n')
  }

  /** use the CLI entry point instead of the Node.js main function */
  runConfigBinary(cwd?: string) {
    if (!this.configBinaryPath) {
      throw new Error('Could not find binary file for @netlify/config')
    }
    return this.runBinary(this.configBinaryPath, cwd, this.getConfigFlags())
  }

  /** use the CLI entry point instead of the Node.js main function */
  runBuildBinary(cwd?: string) {
    if (!this.buildBinaryPath) {
      throw new Error('Could not find binary file for @netlify/build')
    }
    return this.runBinary(this.buildBinaryPath, cwd, this.getBuildFlags())
  }

  private async runBinary(
    binary: string,
    cwd?: string,
    flags: Partial<Flags> = {},
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
        env: environment || {},
        cwd,
      })
      return { output: output || '', exitCode }
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
    const val = Object.entries(value as Record<string, boolean>)
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
