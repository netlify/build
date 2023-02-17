import type { PackageJson } from 'read-pkg'

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
  id: string
  name: string
  category: Category
  configFiles: string[]
  npmDependencies: string[]
  version?: string
  staticAssetsDirectory?: string
  dev?: {
    command: string
    port: number
    pollingStrategies: PollingStrategy[]
  }
  build: {
    command: string
    directory: string
  }
  plugins: string[]
  env: Record<string, string>

  detect(project: Project): Promise<Framework | undefined>
}

type VerboseDetection = { npmDependency: string } | { config: string }

export abstract class BaseFramework {
  id: string
  name: string
  category
  configFiles: string[] = []
  npmDependencies: string[] = []
  plugins: string[] = []
  env = {}

  /** check if the npmDependencies are used inside the provided package.json */
  protected npmDependenciesUsed(pkgJSON: PackageJson): string | undefined {
    return [...Object.keys(pkgJSON.dependencies || {}), ...Object.keys(pkgJSON.devDependencies || {})].find((depName) =>
      this.npmDependencies.includes(depName),
    )
  }

  /**
   * Checks if the project is using a specific framework:
   * - if `npmDependencies` is set, one of them must be present in then `package.json` `dependencies|devDependencies`
   * - if `excludedNpmDependencies` is set, none of them must be present in the `package.json` `dependencies|devDependencies`
   * - if `configFiles` is set, one of the files must exist
   */
  async detect(project: Project): Promise<this | undefined>
  async detect(project: Project, reason: true): Promise<VerboseDetection | undefined>
  async detect(project: Project, reason?: true) {
    // detect if the framework occurs inside the package.json dependencies
    if (this.npmDependencies?.length) {
      const pkg = await project.getPackageJSON()
      const dep = this.npmDependenciesUsed(pkg)
      if (dep) {
        if (reason) {
          return { npmDependency: dep }
        }
        return this
      }

      if (project.workspace?.isRoot === true) {
        for (const pkg of project.workspace.packages) {
          const pkgJSON = await project.fs.readJSON(project.fs.join(project.workspace.rootDir, pkg, 'package.json'))
          const dep = this.npmDependenciesUsed(pkgJSON)
          if (dep) {
            if (reason) {
              return { npmDependency: dep }
            }
            return this
          }
        }
      }
    }

    if (this.configFiles?.length) {
      const config = await project.fs.findUp(this.configFiles, { cwd: project.baseDirectory, stopAt: project.root })
      if (config) {
        if (reason) {
          return { config }
        }
        return this
      }
    }
    // nothing detected
    return
  }
}
