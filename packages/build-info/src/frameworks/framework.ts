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

// type DevServerSetting = {
//   command: string
//   /** The port the framework is served at */
//   frameworkPort: number
//   /** The directory that is used for static assets, to be served. Fallback to the build output directory */
//   dist: string
//   /** The name of the framework */
//   framework: string
//   pollingStrategies: string[]
//   /** list of necessary plugins */
//   plugins: string[]
// }

export abstract class BaseFramework {
  id: string
  name: string
  category: Category

  version?: SemVer
  configFiles: string[] = []
  npmDependencies: string[] = []
  excludedNpmDependencies: string[] = []
  plugins: string[] = []
  env = {}

  constructor(
    /** The current project inside we want to detect the framework */
    public project: Project,
    /** An absolute path considered as the baseDirectory for detection, prefer that over the project baseDirectory */
    public path?: string,
  ) {}

  /** Retrieves the version of a npm package from the node_modules */
  private async getVersionFromNodeModules(packageName: string): Promise<SemVer | undefined> {
    // on the browser we can omit this check
    if (this.project.fs.getEnvironment() === 'browser') {
      return
    }

    try {
      const packageJson = await this.project.fs.findUp(
        this.project.fs.join('node_modules', packageName, 'package.json'),
        {
          cwd: this.path || this.project.baseDirectory,
          stopAt: this.project.root,
        },
      )

      if (packageJson) {
        const { version } = await this.project.fs.readJSON(packageJson)

        if (typeof version === 'string') {
          return parse(version) || undefined
        }
      }
    } catch {
      // noop
    }
  }

  /** check if the npmDependencies are used inside the provided package.json */
  private async npmDependenciesUsed(pkgJSON: PackageJson): Promise<{ name: string; version?: SemVer } | undefined> {
    const found = [
      ...Object.entries(pkgJSON.dependencies || {}),
      ...Object.entries(pkgJSON.devDependencies || {}),
    ].find(([depName]) => this.npmDependencies.includes(depName))

    if (found?.[0]) {
      const version = await this.getVersionFromNodeModules(found[0])
      return {
        name: found[0],
        // coerce to parse syntax like ~0.1.2 or ^1.2.3
        version: version || parse(coerce(found[1])) || undefined,
      }
    }
  }

  /** detect if the framework occurs inside the package.json dependencies */
  private async detectNpmDependency(): Promise<VerboseDetection | undefined | null> {
    // if no dependency was specified for the framework return null
    // to mark explicitly nothing to detect here.
    if (this.npmDependencies.length === 0) {
      return null
    }

    if (this.npmDependencies.length) {
      const pkg = await this.project.getPackageJSON(this.path)
      const dep = await this.npmDependenciesUsed(pkg)
      if (dep) {
        this.version = dep.version
        return { npmDependency: dep }
      }
    }
  }

  /** detect if the framework config file is located somewhere up the tree */
  private async detectConfigFile(): Promise<VerboseDetection | undefined | null> {
    if (this.configFiles.length === 0) {
      return null
    }

    if (this.configFiles?.length) {
      const config = await this.project.fs.findUp(this.configFiles, {
        cwd: this.path || this.project.baseDirectory,
        stopAt: this.project.root,
      })
      if (config) {
        return { config }
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
  async detect(verbose: true): Promise<VerboseDetection | undefined>
  async detect(verbose?: true) {
    const npm = await this.detectNpmDependency()
    const config = await this.detectConfigFile()

    // if both conditions are met it's detected
    // null would indicate that nothing was specified so just go for undefined
    if (npm !== undefined && config !== undefined) {
      if (verbose) {
        return { ...npm, ...config }
      }
      return this
    }
    // nothing detected
  }

  /** This method will be called by the JSON.stringify */
  toJSON() {
    return {}
  }
}
