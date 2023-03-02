import type { NotifiableError } from '@bugsnag/js'
import type { PackageJson } from 'read-pkg'

import type { BuildSystem } from './build-systems/build-system.js'
import { buildSystems } from './build-systems/index.js'
import type { FileSystem } from './file-system.js'
import { report } from './metrics.js'
import { detectPackageManager } from './package-managers/detect-package-manager.js'
import type { PkgManagerFields } from './package-managers/detect-package-manager.js'
import { detectWorkspaces } from './workspaces/detect-workspace.js'
/**
 * The Project represents a Site in Netlify
 * The only configuration here needed is the path to the repository root and the optional baseDirectory
 */
export class Project {
  /** An optional repository root that tells us where to stop looking up */
  root?: string
  /** An absolute path  */
  baseDirectory: string
  packageManager: PkgManagerFields
  /** an absolute path of the root directory for js workspaces where the most top package.json is located */
  jsWorkspaceRoot: string
  /** a representation of the current environment */
  #environment: Record<string, string | undefined> = {}

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

  /** Reports an error with additional metadata */
  report(error: NotifiableError) {
    report(error, {
      metadata: {
        build: {
          baseDirectory: this.baseDirectory,
          root: this.root,
        },
      },
    })
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

  async getPackageJSON(startDirectory?: string): Promise<PackageJson> {
    const pkgPath = await this.fs.findUp('package.json', {
      cwd: startDirectory || this.baseDirectory,
      stopAt: this.root,
    })
    if (pkgPath) {
      return this.fs.readJSON<PackageJson>(pkgPath)
    }
    return {}
  }

  /** Detects the used package Manager */
  async detectPackageManager() {
    this.packageManager = await detectPackageManager(this)
    return this.packageManager
  }

  /** Detects the javascript workspace settings */
  async detectWorkspaces() {
    try {
      return detectWorkspaces(this)
    } catch (error) {
      this.report(error)
      return
    }
  }

  /** Detects all used build systems */
  async detectBuildSystem() {
    try {
      const detected = await Promise.all(
        buildSystems.map(async (BuildSystem) => (await new BuildSystem().detect(this))?.toJSON()),
      )
      return detected.filter(Boolean) as BuildSystem[]
    } catch (error) {
      this.report(error)
      return []
    }
  }
}
