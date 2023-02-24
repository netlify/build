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
  /** The detected frameworks for each path in a project */
  frameworks: Map<string, Framework[]>
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
    // build systems depends on workspaces detection
    await this.detectWorkspaces()

    try {
      const detected: any[] = []
      // perform the detection in series to avoid having the same HTTP request in parallel.
      // It's faster to perform one detection, do all the needed HTTP requests and reuse the results
      // on consecutive runs.
      for (const BuildSystem of buildSystems) {
        const res = await new BuildSystem(this).detect()
        if (res) {
          detected.push(res.toJSON())
        }
      }
      return detected
    } catch {
      return []
    }
  }

  /** Detects all used build systems */
  async detectFrameworks() {
    // if the workspace is undefined, the detection was not run.
    if (this.frameworks !== undefined) {
      return [...this.frameworks.values()].flat()
    }

    try {
      // This needs to be run first
      await this.detectBuildSystem()
      this.frameworks = new Map()

      if (this.workspace?.isRoot) {
        for (const pkg of this.workspace.packages) {
          this.frameworks.set(pkg, await this.detectFrameworksInPath(pkg))
        }
      } else {
        this.frameworks.set('', await this.detectFrameworksInPath())
      }

      return [...this.frameworks.values()].flat()
    } catch {
      return null
    }
  }

  private async detectFrameworksInPath(path?: string) {
    try {
      const detected: Framework[] = []
      // perform the detection in series to avoid having the same HTTP request in parallel.
      // It's faster to perform one detection, do all the needed HTTP requests and reuse the results
      // on consecutive runs.
      for (const Frameowk of frameworks) {
        const res = await new Frameowk(this, path).detect()
        if (res) {
          detected.push(res)
        }
      }
      return detected
    } catch {
      return []
    }
  }

  async getDevServerSettings() {
    await this.detectFrameworks()

    const buildSystem = this.buildSystems.find((system) => system.dev)

    if (buildSystem) {
      console.log(buildSystem)
      // get the framework for the default build system
      // if (this.frameworks.size > 1) {
      // }
      // console.log(this.frameworks)
    }
    // TODO return frameworks
    // console.log(this)
    // return {
    //   command: '',
    //   frameworkPort: number,
    // }
  }
}
