import type { PackageJson } from 'read-pkg'
import { SemVer, coerce, parse } from 'semver'

import { Project } from '../project.js'

export enum Category {
  FrontendFramework = 'frontend_framework',
  SSG = 'static_site_generator',
  BuildTool = 'build_tool',
}

export type PollingStrategy = {
  name
}

export interface Framework {
  project: Project

  id: string
  name: string
  category: Category
  configFiles: string[]
  npmDependencies: string[]
  excludedNpmDependencies?: string[]
  version?: SemVer
  staticAssetsDirectory?: string
  dev?: {
    command: string
    port?: number
    pollingStrategies?: PollingStrategy[]
  }
  build: {
    command: string
    directory: string
  }
  logo?: {
    default: string
    light?: string
    dark?: string
  }
  plugins: string[]
  env: Record<string, string>

  detect(): Promise<Framework | undefined>
}

export type VerboseDetection = {
  npmDependency?: { name: string; version?: SemVer }
  config?: string
}

export abstract class BaseFramework {
  version?: SemVer
  configFiles: string[] = []
  npmDependencies: string[] = []
  plugins: string[] = []
  env = {}

  constructor(public project: Project) {}

  /** check if the npmDependencies are used inside the provided package.json */
  protected npmDependenciesUsed(pkgJSON: PackageJson): { name: string; version?: SemVer } | undefined {
    const found = [
      ...Object.entries(pkgJSON.dependencies || {}),
      ...Object.entries(pkgJSON.devDependencies || {}),
    ].find(([depName]) => this.npmDependencies.includes(depName))

    if (found?.[0]) {
      return {
        name: found[0],
        // coerce to parse syntax like ~0.1.2 or ^1.2.3
        version: parse(coerce(found[1])) || undefined,
      }
    }
  }

  /**
   * Checks if the project is using a specific framework:
   * - if `npmDependencies` is set, one of them must be present in then `package.json` `dependencies|devDependencies`
   * - if `excludedNpmDependencies` is set, none of them must be present in the `package.json` `dependencies|devDependencies`
   * - if `configFiles` is set, one of the files must exist
   */
  async detect(): Promise<this | undefined>
  async detect(reason: true): Promise<VerboseDetection | undefined>
  async detect(reason?: true) {
    // detect if the framework occurs inside the package.json dependencies
    if (this.npmDependencies?.length) {
      const pkg = await this.project.getPackageJSON()
      const dep = this.npmDependenciesUsed(pkg)
      if (dep) {
        this.version = dep.version
        if (reason) {
          return { npmDependency: dep } as VerboseDetection
        }
        return this
      }

      if (this.project.workspace?.isRoot === true) {
        for (const pkg of this.project.workspace.packages) {
          const pkgJSON = await this.project.fs.readJSON(
            this.project.fs.join(this.project.workspace.rootDir, pkg, 'package.json'),
          )
          const dep = this.npmDependenciesUsed(pkgJSON)
          if (dep) {
            this.version = dep.version
            if (reason) {
              return { npmDependency: dep } as VerboseDetection
            }
            return this
          }
        }
      }
    }

    if (this.configFiles?.length) {
      const config = await this.project.fs.findUp(this.configFiles, {
        cwd: this.project.baseDirectory,
        stopAt: this.project.root,
      })
      if (config) {
        if (reason) {
          return { config } as VerboseDetection
        }
        return this
      }
    }
    // nothing detected
    return
  }
}
