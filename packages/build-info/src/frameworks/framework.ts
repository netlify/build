import type { PackageJson } from 'read-pkg'
import { SemVer, coerce, parse } from 'semver'

import { Project } from '../project.js'

export enum Category {
  FrontendFramework = 'frontend_framework',
  SSG = 'static_site_generator',
  BuildTool = 'build_tool',
}

export enum Accuracy {
  NPM = 3, // Matched the npm dependency (highest accuracy on detecting it)
  ConfigOnly = 2, // Only a config file was specified and matched
  Config = 1, // Has npm dependencies specified as well but there it did not match (least resort)
}

export type PollingStrategy = {
  name
}

/** Information on how it was detected and how accurate the detection is */
export type Detection = {
  /**
   * The grade of how much we trust in having the right result detected.
   * Sometimes it's hard to predict it to 100% as for config files, some frameworks can share the same config file
   */
  accuracy: Accuracy
  /** The NPM package that was able to detect it (high accuracy) */
  package?: { name: string; version?: SemVer }
  /** The config file that is associated with the framework */
  config?: string
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
  /** Information on how it was detected and how accurate the detection is */
  detected?: Detection
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

  detect(): Promise<DetectedFramework | undefined>
}

export type DetectedFramework = Omit<Framework, 'detected'> & { detected: Detection }

/**
 * sort a list of frameworks based on the accuracy and on it's type (prefer static site generators over build tools)
 * from most accurate to least accurate
 * 1. a npm dependency was specified and matched
 * 2. only a config file was specified and matched
 * 3. an npm dependency was specified but matched over the config file (least accurate)
 */
export function sortFrameworksBasedOnAccuracy(a: DetectedFramework, b: DetectedFramework): number {
  let sort = a.detected.accuracy > b.detected.accuracy ? -1 : a.detected.accuracy < b.detected.accuracy ? 1 : 0

  if (sort >= 0) {
    // prefer SSG over build tools
    if (a.category === Category.SSG && b.category === Category.BuildTool) {
      sort--
    }
  }
  return sort
}

export abstract class BaseFramework {
  id: string
  name: string
  category: Category
  detected?: Detection

  version?: SemVer
  configFiles: string[] = []
  npmDependencies: string[] = []
  excludedNpmDependencies: string[] = []
  plugins: string[] = []
  env = {}

  build = {
    command: 'npm run build',
    directory: 'dist',
  }

  constructor(
    /** The current project inside we want to detect the framework */
    public project: Project,
    /** An absolute path considered as the baseDirectory for detection, prefer that over the project baseDirectory */
    public path?: string,
  ) {
    if (project.packageManager?.runCommand) {
      this.build.command = `${project.packageManager.runCommand} build`
    }
  }

  setDetected(accuracy: Accuracy, reason?: { name: string; version?: SemVer } | string): DetectedFramework {
    this.detected = {
      accuracy,
    }

    if (typeof reason === 'string') {
      this.detected.config = reason
    } else {
      this.detected.package = reason
    }

    return this as DetectedFramework
  }

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
  private async detectNpmDependency() {
    if (this.npmDependencies.length) {
      const pkg = await this.project.getPackageJSON(this.path)
      const dep = await this.npmDependenciesUsed(pkg)
      if (dep) {
        this.version = dep.version
        return dep
      }
    }
  }

  /** detect if the framework config file is located somewhere up the tree */
  private async detectConfigFile() {
    if (this.configFiles?.length) {
      return await this.project.fs.findUp(this.configFiles, {
        cwd: this.path || this.project.baseDirectory,
        stopAt: this.project.root,
      })
    }
  }

  /**
   * Checks if the project is using a specific framework:
   * - if `npmDependencies` is set, one of them must be present in then `package.json` `dependencies|devDependencies`
   * - if `excludedNpmDependencies` is set, none of them must be present in the `package.json` `dependencies|devDependencies`
   * - if `configFiles` is set, one of the files must exist
   */
  async detect(): Promise<DetectedFramework | undefined> {
    const npm = await this.detectNpmDependency()
    const config = await this.detectConfigFile()

    if (npm) {
      return this.setDetected(Accuracy.NPM, npm)
    }

    if (config) {
      // Have higher trust on a detection of a config file if there is no npm dependency specified for this framework
      // otherwise the npm dependency should have already triggered the detection
      return this.setDetected(this.npmDependencies.length === 0 ? Accuracy.ConfigOnly : Accuracy.Config, config)
    }
    // nothing detected
  }

  /** This method will be called by the JSON.stringify */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
    }
  }
}
