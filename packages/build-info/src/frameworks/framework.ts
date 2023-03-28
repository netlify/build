import type { PackageJson } from 'read-pkg'
import { SemVer, coerce, parse } from 'semver'

import { Environment } from '../file-system.js'
import { getDevCommands } from '../get-dev-commands.js'
import { Project } from '../project.js'

export enum Category {
  FrontendFramework = 'frontend_framework',
  SSG = 'static_site_generator',
  BuildTool = 'build_tool',
}

export enum Accuracy {
  NPM = 4, // Matched the npm dependency (highest accuracy on detecting it)
  ConfigOnly = 3, // Only a config file was specified and matched
  Config = 2, // Has npm dependencies specified as well but there it did not match (least resort)
  NPMHoisted = 1, // Matched the npm dependency but in a folder up the provided path
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
  packageJSON?: PackageJson
  /** The config file that is associated with the framework */
  config?: string
}

export type FrameworkInfo = ReturnType<Framework['toJSON']>

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
  toJSON(): {
    id: string
    name: string
    category: Category
    package: {
      name?: string // if detected via config file the name can be empty
      version: string | 'unknown'
    }
    dev: {
      commands: string[]
      port?: number
      pollingStrategies?: PollingStrategy[]
    }
    build: {
      commands: string[]
      directory: string
    }
    staticAssetsDirectory?: string
    env: Record<string, string>
    logo?: Record<string, string>
    plugins: string[]
  }
}

export type DetectedFramework = Omit<Framework, 'detected'> & { detected: Detection }

/** Filters a list of detected frameworks by relevance, meaning we drop build tools if we find static site generators */
export function filterByRelevance(detected: DetectedFramework[]) {
  const filtered: DetectedFramework[] = []

  for (const framework of detected.sort(sortFrameworksBasedOnAccuracy)) {
    // only keep the frameworks on the highest accuracy level. (so if multiple SSG are detected use them but drop build tools)
    if (filtered.length === 0 || filtered[0].detected.accuracy === framework.detected.accuracy) {
      filtered.push(framework)
    }
  }
  return filtered
}

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

/** Merges a list of detection results based on accuracy to get the one with the highest accuracy */
export function mergeDetections(detections: Array<Detection | undefined>): Detection | undefined {
  return detections
    .filter(Boolean)
    .sort((a: Detection, b: Detection) => (a.accuracy > b.accuracy ? -1 : a.accuracy < b.accuracy ? 1 : 0))?.[0]
}

export abstract class BaseFramework implements Framework {
  id: string
  name: string
  category: Category
  detected?: Detection
  version?: SemVer
  configFiles: string[] = []
  npmDependencies: string[] = []
  excludedNpmDependencies: string[] = []
  plugins: string[] = []
  staticAssetsDirectory?: string
  env = {}
  dev?: {
    command: string
    port?: number
    pollingStrategies?: PollingStrategy[]
  }
  build = {
    command: 'npm run build',
    directory: 'dist',
  }
  logo?: {
    default: string
    light?: string
    dark?: string
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
    if (this.project.fs.getEnvironment() === Environment.Browser) {
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
    const allDeps = [...Object.entries(pkgJSON.dependencies || {}), ...Object.entries(pkgJSON.devDependencies || {})]

    const found = allDeps.find(([depName]) => this.npmDependencies.includes(depName))
    // check for excluded dependencies
    const excluded = allDeps.some(([depName]) => this.excludedNpmDependencies.includes(depName))

    if (!excluded && found?.[0]) {
      const version = await this.getVersionFromNodeModules(found[0])
      return {
        name: found[0],
        // coerce to parse syntax like ~0.1.2 or ^1.2.3
        version: version || parse(coerce(found[1])) || undefined,
      }
    }
  }

  /** detect if the framework occurs inside the package.json dependencies */
  private async detectNpmDependency(): Promise<Detection | undefined> {
    if (this.npmDependencies.length) {
      const startDir = this.path || this.project.baseDirectory
      const pkg = await this.project.getPackageJSON(startDir)
      const dep = await this.npmDependenciesUsed(pkg)
      if (dep) {
        this.version = dep.version
        return {
          // if the match of the npm package was in a directory up we don't have a high accuracy
          accuracy: this.project.fs.join(startDir, 'package.json') === pkg.pkgPath ? Accuracy.NPM : Accuracy.NPMHoisted,
          package: dep,
          packageJSON: pkg,
        }
      }
    }
  }

  /** detect if the framework config file is located somewhere up the tree */
  private async detectConfigFile(): Promise<Detection | undefined> {
    if (this.configFiles?.length) {
      const config = await this.project.fs.findUp(this.configFiles, {
        cwd: this.path || this.project.baseDirectory,
        stopAt: this.project.root,
      })

      if (config) {
        return {
          // Have higher trust on a detection of a config file if there is no npm dependency specified for this framework
          // otherwise the npm dependency should have already triggered the detection
          accuracy: this.npmDependencies.length === 0 ? Accuracy.ConfigOnly : Accuracy.Config,
          config,
        }
      }
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
    this.detected = mergeDetections([npm, config])

    if (this.detected) {
      return this as DetectedFramework
    }
    // nothing detected
  }

  /**
   * Retrieve framework's dev commands.
   * We use, in priority order:
   *   - `package.json` `scripts` containing the frameworks dev command
   *   - `package.json` `scripts` whose names are among a list of common dev scripts like: `dev`, `serve`, `develop`, ...
   *   -  The frameworks dev command
   */
  getDevCommands() {
    // Some frameworks don't have a dev command
    if (this.dev?.command === undefined) {
      return []
    }

    const devCommands = getDevCommands(this.dev.command, this.detected?.packageJSON?.scripts as Record<string, string>)
    if (devCommands.length > 0) {
      return devCommands.map((command) => this.project.getNpmScriptCommand(command))
    }

    return [this.dev.command]
  }

  /** This method will be called by the JSON.stringify */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      package: {
        name: this.detected?.package?.name || this.npmDependencies?.[0],
        version: this.detected?.package?.version?.raw || 'unknown',
      },
      category: this.category,
      dev: {
        commands: this.getDevCommands(),
        port: this.dev?.port,
        pollingStrategies: this.dev?.pollingStrategies,
      },
      build: {
        commands: [this.build.command],
        directory: this.build.directory,
      },
      staticAssetsDirectory: this.staticAssetsDirectory,
      env: this.env,
      logo: this.logo
        ? Object.entries(this.logo).reduce(
            (prev, [key, value]) => ({ ...prev, [key]: `https://framework-info.netlify.app${value}` }),
            {},
          )
        : undefined,
      plugins: this.plugins,
    }
  }
}
