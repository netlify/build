import type { PackageJson } from 'read-pkg'

import type { BuildSystem } from './build-systems/build-system.js'
import { buildSystems } from './build-systems/index.js'
import type { FileSystem } from './file-system.js'
import { detectPackageManager } from './package-managers/detect-package-manager.js'
import type { PkgManagerFields } from './package-managers/detect-package-manager.js'
import { detectWorkspaces } from './workspaces/detect-workspace.js'

/**
 * The Project represents a Site in Netlify
 * The only configuration here needed is the path to the repository root and the optional baseDirectory
 */
export class Project {
  /** an absolute path of the repository root */
  root: string
  /** an absolute path of the base directory. Can be the same as the repository root if not set */
  baseDirectory: string
  packageManager: PkgManagerFields
  /** an absolute path of the root directory for js workspaces where the most top package.json is located */
  jsWorkspaceRoot: string
  /** a representation of the current environment */
  #environment: Record<string, string | undefined> = {}

  constructor(public fs: FileSystem, root: string, baseDirectory?: string) {
    this.root = fs.resolve(root)

    this.baseDirectory = baseDirectory
      ? fs.isAbsolute(baseDirectory)
        ? baseDirectory
        : fs.join(root, baseDirectory)
      : root

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
    const rootJSONPath = (await this.fs.findUpMultiple('package.json', { cwd: this.baseDirectory })).pop()
    if (rootJSONPath) {
      this.jsWorkspaceRoot = this.fs.dirname(rootJSONPath)
      return this.fs.readJSON<PackageJson>(rootJSONPath)
    }
    return {}
  }

  async getPackageJSON(startDirectory?: string): Promise<PackageJson> {
    const pkgPath = await this.fs.findUp('package.json', { cwd: startDirectory || this.baseDirectory })
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
    } catch {
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
    } catch {
      return []
    }
  }
}
