import type { PackageJson } from 'read-pkg'
import { SemVer, parse, coerce } from 'semver'

import type { BuildSystem } from './build-systems/build-system.js'
import { buildSystems } from './build-systems/index.js'
import type { FileSystem } from './file-system.js'
import { Framework } from './frameworks/framework.js'
import { frameworks } from './frameworks/index.js'
import { detectPackageManager } from './package-managers/detect-package-manager.js'
import type { PkgManagerFields } from './package-managers/detect-package-manager.js'
import { WorkspaceInfo, detectWorkspaces } from './workspaces/detect-workspace.js'
/**
 * The Project represents a Site in Netlify
 * The only configuration here needed is the path to the repository root and the optional baseDirectory
 */
export class Project {
  /** An optional repository root that tells us where to stop looking up */
  root?: string
  /** An absolute path  */
  baseDirectory: string
  /** the detected package manager (if null it's not a javascript project, undefined indicates that id did not run yet) */
  packageManager: PkgManagerFields | null
  /** an absolute path of the root directory for js workspaces where the most top package.json is located */
  jsWorkspaceRoot: string
  /* the detected javascript workspace information (if null it's not a workspace, undefined indicates that id did not run yet) */
  workspace: WorkspaceInfo | null
  /** The detected build-systems */
  buildSystems: BuildSystem[]
  /** The detected frameworks */
  frameworks: Framework[]
  /** a representation of the current environment */
  #environment: Record<string, string | undefined> = {}

  /** The current nodeVersion (can be set by node.js environments) */
  private _nodeVersion: SemVer | null = null

  setNodeVersion(version: string): this {
    this._nodeVersion = parse(version)
    return this
  }

  async getCurrentNodeVersion(): Promise<SemVer | null> {
    if (this._nodeVersion) {
      return this._nodeVersion
    }
    const nodeEnv = parse(coerce(this.getEnv('NODE_VERSION')), {
      loose: true,
    })
    if (nodeEnv) {
      return nodeEnv
    }

    // TODO: parse .nvm file as well
    return null
  }

  constructor(public fs: FileSystem, baseDirectory?: string, root?: string) {
    this.baseDirectory = fs.resolve(root || '', baseDirectory !== undefined ? baseDirectory : fs.cwd)
    this.root = root ? fs.resolve(fs.cwd, root) : undefined

    // if the root and the base directory are the same unset the root again as its not a workspace
    if (this.root === this.baseDirectory) {
      this.root = undefined
    }

    this.fs.cwd = this.baseDirectory
  }

  /** Set's the environment for the project */
  setEnvironment(env: Record<string, string | undefined>): this {
    this.#environment = env
    return this
  }

  /** retrieves an environment variable */
  getEnv(key: string): string | undefined {
    return this.#environment[key]
  }

  /** retrieves the root package.json file */
  async getRootPackageJSON(): Promise<PackageJson> {
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
  async getPackageJSON(startDirectory?: string): Promise<PackageJson & { pkgPath: string | null }> {
    const pkgPath = await this.fs.findUp('package.json', {
      cwd: startDirectory || this.baseDirectory,
      stopAt: this.root,
    })
    if (pkgPath) {
      const json = await this.fs.readJSON<PackageJson>(pkgPath)
      return {
        ...json,
        pkgPath,
      }
    }
    return { pkgPath: null }
  }

  /** Detects the used package Manager */
  async detectPackageManager() {
    // if the packageManager is undefined, the detection was not run.
    // if it is an object or null it has already run
    if (this.packageManager !== undefined) {
      return this.packageManager
    }
    try {
      this.packageManager = await detectPackageManager(this)
      return this.packageManager
    } catch {
      return null
    }
  }

  /** Detects the javascript workspace settings */
  async detectWorkspaces() {
    // if the workspace is undefined, the detection was not run.
    // if it is an object or null it has already run
    if (this.workspace !== undefined) {
      return this.workspace
    }

    // workspaces depend on package manager detection so run it first
    await this.detectPackageManager()
    try {
      this.workspace = await detectWorkspaces(this)
      return this.workspace
    } catch {
      return null
    }
  }

  /** Detects all used build systems */
  async detectBuildSystem() {
    // if the workspace is undefined, the detection was not run.
    if (this.buildSystems !== undefined) {
      return this.buildSystems
    }
    try {
      const detected = await Promise.all(buildSystems.map(async (BuildSystem) => await new BuildSystem().detect(this)))
      this.buildSystems = detected.filter(Boolean) as BuildSystem[]
      return this.buildSystems
    } catch {
      return []
    }
  }

  /** Detects all used build systems */
  async detectFrameworks() {
    // if the workspace is undefined, the detection was not run.
    if (this.frameworks !== undefined) {
      return this.frameworks
    }

    // frameworks depend on build system and workspace detection so run it first
    // await this.detectBuildSystem()
    await this.detectWorkspaces()

    try {
      const detected = await Promise.all(frameworks.map(async (Framework) => await new Framework(this).detect()))
      this.frameworks = detected.filter(Boolean) as Framework[]
      return this.frameworks
    } catch {
      return []
    }
  }
}
