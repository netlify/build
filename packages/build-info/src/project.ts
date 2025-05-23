import type { Client, NotifiableError } from '@bugsnag/js'
import type { PackageJson } from 'read-pkg'
import { SemVer, coerce, parse } from 'semver'

import type { BuildSystem } from './build-systems/build-system.js'
import { buildSystems } from './build-systems/index.js'
import { EventEmitter } from './events.js'
import { FileSystem } from './file-system.js'
import { DetectedFramework, filterByRelevance } from './frameworks/framework.js'
import { frameworks } from './frameworks/index.js'
import { getFramework } from './get-framework.js'
import { Logger } from './logger.js'
import { Severity, report } from './metrics.js'
import {
  AVAILABLE_PACKAGE_MANAGERS,
  PkgManagerFields,
  detectPackageManager,
} from './package-managers/detect-package-manager.js'
import { runtimes } from './runtime/index.js'
import { LangRuntime } from './runtime/runtime.js'
import { Settings, getBuildSettings } from './settings/get-build-settings.js'
import { WorkspaceInfo, detectWorkspaces } from './workspaces/detect-workspace.js'

type Events = {
  detectPackageManager: (data: PkgManagerFields | null) => void
  detectedWorkspaceGlobs: () => void // indicates that we have packages and start detecting them
  detectWorkspaces: (data: WorkspaceInfo | null) => void
  detectBuildsystems: (data: BuildSystem[]) => void
  detectFrameworks: (data: Map<string, DetectedFramework[]>) => void
  detectSettings: (data: Settings[]) => void
  detectRuntimes: (data: LangRuntime[]) => void
}

/**
 * The Project represents a Site in Netlify
 * The only configuration here needed is the path to the repository root and the optional baseDirectory
 */
export class Project {
  /** An optional repository root that tells us where to stop looking up */
  root?: string
  /** An absolute path  */
  baseDirectory: string
  /** a relative base directory (like the path to workspace packages)  */
  relativeBaseDirectory?: string
  /** the detected package manager (if null it's not a javascript project, undefined indicates that id did not run yet) */
  packageManager: PkgManagerFields | null
  /** an absolute path of the root directory for js workspaces where the most top package.json is located */
  jsWorkspaceRoot: string
  /* the detected javascript workspace information (if null it's not a workspace, undefined indicates that id did not run yet) */
  workspace: WorkspaceInfo | null
  /** The detected build-systems */
  buildSystems: BuildSystem[]
  /** The combined build settings for a project, in a workspace there can be multiple settings per package */
  settings: Settings[]
  /** The detected frameworks for each path in a project */
  frameworks: Map<string, DetectedFramework[]>
  /** The detected language runtimes */
  runtimes: LangRuntime[]
  /** a representation of the current environment */
  #environment: Record<string, string | undefined> = {}
  /** A bugsnag session */
  bugsnag: Client
  /** A logging instance  */
  logger: Logger

  /** A function that is used to report errors */
  reportFn: typeof report = report

  events = new EventEmitter<Events>()

  /** The current nodeVersion (can be set by node.js environments) */
  private _nodeVersion: SemVer | null = null

  setNodeVersion(version: string): this {
    this._nodeVersion = parse(coerce(version), { loose: true })
    return this
  }

  async getCurrentNodeVersion(): Promise<SemVer | null> {
    if (this._nodeVersion) {
      return this._nodeVersion
    }
    const nodeEnv = parse(coerce(this.getEnv('NODE_VERSION')), { loose: true })
    if (nodeEnv) {
      return nodeEnv
    }

    const nvmrc = await this.fs.gracefullyReadFile('.nvmrc')
    if (nvmrc) {
      return parse(coerce(nvmrc, { loose: true }))
    }

    const nodeVersion = await this.fs.gracefullyReadFile('.node_version')
    if (nodeVersion) {
      return parse(coerce(nodeVersion, { loose: true }))
    }

    // TODO: think of returning a default node version
    return null
  }

  async isRedwoodProject(): Promise<boolean> {
    return await this.fs.fileExists(this.fs.resolve(this.fs.cwd, 'redwood.toml'))
  }

  constructor(
    public fs: FileSystem,
    baseDirectory?: string,
    root?: string,
  ) {
    this.baseDirectory = fs.resolve(root || '', baseDirectory !== undefined ? baseDirectory : fs.cwd)
    this.root = root ? fs.resolve(fs.cwd, root) : undefined

    this.relativeBaseDirectory =
      baseDirectory !== undefined && !fs.isAbsolute(baseDirectory)
        ? baseDirectory
        : fs.relative(this.root || fs.cwd, this.baseDirectory)

    this.fs.cwd = this.baseDirectory
    this.logger = fs.logger
  }

  /** Set's the environment for the project */
  setEnvironment(env: Record<string, string | undefined>): this {
    this.#environment = env
    return this
  }

  /** Sets the function that is used to report errors. Overrides the default bugsnag reporting for the project */
  setReportFn(fn: typeof report): this {
    this.reportFn = fn
    return this
  }

  /** Sets a bugsnag client for the current session */
  setBugsnag(client?: Client): this {
    if (client) {
      this.bugsnag = client
    }
    return this
  }

  /** retrieves an environment variable */
  getEnv(key: string): string | undefined {
    return this.#environment[key]
  }

  /** Reports an error with additional metadata */
  report(
    error: NotifiableError,
    config: { metadata?: Record<string, any>; severity?: Severity; context?: string } = {},
  ) {
    this.fs.logger.error(error)
    this.reportFn(error, {
      metadata: {
        build: {
          baseDirectory: this.baseDirectory,
          root: this.root,
        },
        ...(config.metadata || {}),
      },
      context: config.context,
      severity: config.severity,
      client: this.bugsnag,
    })
  }

  /** Retrieve the run command for an npm script  */
  getNpmScriptCommand(npmScript: string): string {
    const runCmd = this.packageManager?.runCommand || AVAILABLE_PACKAGE_MANAGERS.npm.runCommand
    return `${runCmd} ${npmScript}`
  }

  /** retrieves the root package.json file */
  async getRootPackageJSON(): Promise<Partial<PackageJson>> {
    // get the most upper json file
    const rootJSONPath = (
      await this.fs.findUpMultiple('package.json', { cwd: this.baseDirectory, stopAt: this.root })
    ).pop()
    if (rootJSONPath) {
      this.jsWorkspaceRoot = this.fs.dirname(rootJSONPath)
      return this.fs.readJSON<PackageJson>(rootJSONPath)
    }
    return {}
  }

  /** Retrieves the package.json and if one found with it's pkgPath */
  async getPackageJSON(startDirectory?: string): Promise<Partial<PackageJson> & { pkgPath: string | null }> {
    const pkgPath = await this.fs.findUp('package.json', {
      cwd: startDirectory || this.baseDirectory,
      stopAt: this.root,
    })
    if (pkgPath) {
      const json = await this.fs.readJSON<PackageJson>(pkgPath)
      return Object.assign(json, { pkgPath })
    }
    return { pkgPath: null }
  }

  /** Resolves a path correctly with a package path, independent of run from the workspace root or from a package */
  resolveFromPackage(packagePath: string, ...parts: string[]) {
    if (this.jsWorkspaceRoot) {
      return this.fs.join(this.jsWorkspaceRoot, packagePath, ...parts)
    }

    return this.baseDirectory.endsWith(packagePath) && !this.workspace?.isRoot
      ? this.fs.join(this.baseDirectory, ...parts)
      : this.fs.resolve(packagePath, ...parts)
  }

  /** Detects the used package Manager */
  async detectPackageManager() {
    this.logger.debug('[project.ts]: detectPackageManager')
    // if the packageManager is undefined, the detection was not run.
    // if it is an object or null it has already run
    if (this.packageManager !== undefined) {
      return this.packageManager
    }
    try {
      this.packageManager = await detectPackageManager(this)
      await this.events.emit('detectPackageManager', this.packageManager)
      return this.packageManager
    } catch {
      return null
    }
  }

  /** Detects the javascript workspace settings */
  async detectWorkspaces() {
    this.logger.debug('[project.ts]: detectWorkspaces')
    // if the workspace is undefined, the detection was not run.
    // if it is an object or null it has already run
    if (this.workspace !== undefined) {
      return this.workspace
    }
    // workspaces depend on package manager detection so run it first
    await this.detectPackageManager()

    try {
      this.workspace = await detectWorkspaces(this)
      await this.events.emit('detectWorkspaces', this.workspace)
      return this.workspace
    } catch (error) {
      this.report(error)
      return null
    }
  }

  /** Detects all used build systems */
  async detectBuildSystem() {
    this.logger.debug('[project.ts]: detectBuildSystem')
    // if the workspace is undefined, the detection was not run.
    if (this.buildSystems !== undefined) {
      return this.buildSystems
    }
    // build systems depends on workspaces detection
    await this.detectWorkspaces()

    try {
      this.buildSystems = (await Promise.all(buildSystems.map((BuildSystem) => new BuildSystem(this).detect()))).filter(
        Boolean,
      ) as BuildSystem[]
      await this.events.emit('detectBuildsystems', this.buildSystems)

      return this.buildSystems
    } catch (error) {
      this.report(error)
      return []
    }
  }

  /** Detects all used runtimes */
  async detectRuntime() {
    this.logger.debug('[project.ts]: detectRuntime')
    try {
      this.runtimes = (await Promise.all(runtimes.map((Runtime) => new Runtime(this).detect()))).filter(
        Boolean,
      ) as LangRuntime[]
      this.events.emit('detectRuntimes', this.runtimes)
      return this.runtimes
    } catch (error) {
      this.report(error)
      return []
    }
  }

  /** Detects all used frameworks */
  async detectFrameworks() {
    this.logger.debug('[project.ts]: detectFrameworks')
    // if the workspace is undefined, the detection was not run.
    if (this.frameworks !== undefined) {
      return [...this.frameworks.values()].flat()
    }

    try {
      // This needs to be run first
      await this.detectBuildSystem()
      this.frameworks = new Map()

      if (this.workspace) {
        // if we have a workspace parallelize in all workspaces
        await Promise.all(
          this.workspace.packages.map(async ({ path: pkg, forcedFramework }) => {
            if (forcedFramework) {
              try {
                const framework = await getFramework(forcedFramework, this)
                this.frameworks.set(pkg, [framework])
              } catch {
                // noop framework not found
              }
            } else if (this.workspace) {
              const result = await this.detectFrameworksInPath(this.fs.join(this.workspace.rootDir, pkg))
              this.frameworks.set(pkg, result)
            }
          }),
        )
      } else {
        this.frameworks.set('', await this.detectFrameworksInPath())
      }

      await this.events.emit('detectFrameworks', this.frameworks)
      return [...this.frameworks.values()].flat()
    } catch (error) {
      this.report(error)
      return null
    }
  }

  async detectFrameworksInPath(path?: string): Promise<DetectedFramework[]> {
    this.logger.debug(`[project.ts]: detectFrameworksInPath - ${path}`)
    try {
      const detected = (await Promise.all(frameworks.map((Framework) => new Framework(this, path).detect()))).filter(
        Boolean,
      ) as DetectedFramework[]
      // sort based on the accuracy and drop un accurate results if something more accurate was found
      // from most accurate to least accurate
      // 1. a npm dependency was specified and matched
      // 2. only a config file was specified and matched
      // 3. an npm dependency was specified but matched over the config file (least accurate)
      // and prefer SSG over build tools
      return filterByRelevance(detected)
    } catch {
      return []
    }
  }

  async getBuildSettings(packagePath?: string): Promise<Settings[]> {
    this.logger.debug('[project.ts]: getBuildSettings')
    // if the settings is undefined, the detection was not run.
    // if it is an array it has already run
    if (this.settings !== undefined) {
      return this.settings
    }
    this.settings = []

    try {
      // This needs to be run first
      await this.detectFrameworks()

      this.settings = await getBuildSettings(this, packagePath)
      await this.events.emit('detectSettings', this.settings)
    } catch (error) {
      this.report(error)
    }
    return this.settings
  }
}
