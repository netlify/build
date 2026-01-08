import type { PackageJson } from 'read-pkg'
import { SemVer, coerce, parse } from 'semver'

import { Environment } from '../file-system.js'
import { getBuildCommands, getDevCommands } from '../get-commands.js'
import { Project } from '../project.js'

export type FrameworkId =
  | 'analog'
  | 'angular'
  | 'assemble'
  | 'astro'
  | 'blitz'
  | 'brunch'
  | 'cecil'
  | 'create-react-app'
  | 'docpad'
  | 'docusaurus'
  | 'eleventy'
  | 'ember'
  | 'expo'
  | 'gatsby'
  | 'gridsome'
  | 'grunt'
  | 'gulp'
  | 'harp'
  | 'hexo'
  | 'hono'
  | 'hugo'
  | 'hydrogen'
  | 'jekyll'
  | 'metalsmith'
  | 'middleman'
  | 'next'
  | 'nuxt'
  | 'observable'
  | 'parcel'
  | 'phenomic'
  | 'quasar'
  | 'qwik'
  | 'react-router'
  | 'react-static'
  | 'redwoodjs'
  | 'remix'
  | 'roots'
  | 'sapper'
  | 'solid-js'
  | 'solid-start'
  | 'stencil'
  | 'svelte'
  | 'svelte-kit'
  | 'tanstack-router'
  | 'tanstack-start'
  | 'vike'
  | 'vite'
  | 'vue'
  | 'vuepress'
  | 'waku'
  | 'wintersmith'
  | 'wmr'
  | 'zola'

export enum Category {
  BackendFramework = 'backend_framework',
  FrontendFramework = 'frontend_framework',
  SSG = 'static_site_generator',
  BuildTool = 'build_tool',
}

export enum Accuracy {
  Forced = 5, // Forced framework, this means that we don't detect the framework instead it get's set either through the user inside the toml or through the build system like nx-integrated
  NPM = 4, // Matched the npm dependency (highest accuracy on detecting it)
  ConfigOnly = 3, // Only a config file was specified and matched
  Config = 2, // Has npm dependencies specified as well but there it did not match (least resort)
  NPMHoisted = 1, // Matched the npm dependency but in a folder up the provided path
}

export enum VersionAccuracy {
  NodeModules = 'node_modules', // High accuracy: read from installed package in node_modules
  PackageJSONPinned = 'package_json_pinned', // Medium accuracy: exact pinned version from package.json (e.g., "1.2.3")
  PackageJSON = 'package_json', // Low accuracy: parsed from package.json dependency range (e.g., "^1.2.3")
}

export type PollingStrategy = {
  // TODO(serhalp) Define an enum
  name: string
}

/** Information on how it was detected and how accurate the detection is */
export type Detection = {
  /**
   * The grade of how much we trust in having the right result detected.
   * Sometimes it's hard to predict it to 100% as for config files, some frameworks can share the same config file
   */
  accuracy: Accuracy
  /** The NPM package that was able to detect it (high accuracy) */
  package?: {
    name: string
    version?: SemVer
    versionAccuracy?: VersionAccuracy
  }
  packageJSON?: Partial<PackageJson>
  /** The absolute path to config file that is associated with the framework */
  config?: string
  /** The name of config file that is associated with the framework */
  configName?: string
}

export type FrameworkInfo = ReturnType<Framework['toJSON']>

export interface Framework {
  project: Project

  id: FrameworkId
  name: string
  category: Category
  /**
   * If this is set, at least ONE of these must exist, anywhere in the project
   */
  configFiles: string[]
  /**
   * If this is set, at least ONE of these must be present in the `package.json` `dependencies|devDependencies`
   */
  npmDependencies: string[]
  /**
   * if this is set, NONE of these must be present in the `package.json` `dependencies|devDependencies`
   */
  excludedNpmDependencies?: string[]
  version?: SemVer
  /** Information on how it was detected and how accurate the detection is */
  detected?: Detection
  staticAssetsDirectory?: string
  dev?: {
    command: string
    port?: number
    pollingStrategies?: PollingStrategy[]
    clearPublishDirectory?: boolean
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
  getDevCommands(): string[]
  getBuildCommands(): string[]
  toJSON(): {
    id: string
    name: string
    category: Category
    package: {
      name?: string // if detected via config file the name can be empty
      version: string | 'unknown'
      versionAccuracy?: VersionAccuracy
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
  const sort = b.detected.accuracy - a.detected.accuracy

  // Secondary sorting on Category
  if (sort === 0) {
    const categoryRanking = [Category.BackendFramework, Category.FrontendFramework, Category.BuildTool, Category.SSG]
    return categoryRanking.indexOf(b.category) - categoryRanking.indexOf(a.category)
  }

  return sort
}

/** Merges a list of detection results based on accuracy to get the one with the highest accuracy that still contains information provided by all other detections */
export function mergeDetections(detections: (Detection | undefined)[]): Detection | undefined {
  const definedDetections = detections
    .filter(function isDetection(d): d is Detection {
      return Boolean(d)
    })
    .sort((a: Detection, b: Detection) => (a.accuracy > b.accuracy ? -1 : a.accuracy < b.accuracy ? 1 : 0))

  if (definedDetections.length === 0) {
    return
  }

  return definedDetections.slice(1).reduce((merged, detection) => {
    merged.config = merged.config ?? detection.config
    merged.configName = merged.configName ?? detection.configName
    merged.package = merged.package ?? detection.package
    merged.packageJSON = merged.packageJSON ?? detection.packageJSON

    return merged
  }, definedDetections[0])
}

export abstract class BaseFramework implements Framework {
  id: FrameworkId
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
  private async npmDependenciesUsed(
    pkgJSON: Partial<PackageJson>,
  ): Promise<{ name: string; version?: SemVer; versionAccuracy?: VersionAccuracy } | undefined> {
    const allDeps = {
      ...(pkgJSON.dependencies ?? {}),
      ...(pkgJSON.devDependencies ?? {}),
    }
    const matchedDepName = Object.keys(allDeps).find((depName) => this.npmDependencies.includes(depName))
    const hasExcludedDeps = Object.keys(allDeps).some((depName) => this.excludedNpmDependencies.includes(depName))

    if (!hasExcludedDeps && matchedDepName != null) {
      const versionFromNodeModules = await this.getVersionFromNodeModules(matchedDepName)
      if (versionFromNodeModules) {
        return {
          name: matchedDepName,
          version: versionFromNodeModules,
          versionAccuracy: VersionAccuracy.NodeModules,
        }
      }

      const matchedDepVersion = allDeps[matchedDepName]

      // Try to parse without coercing first to detect pinned versions (e.g., "1.2.3")
      const pinnedVersion = parse(matchedDepVersion)
      if (pinnedVersion) {
        return {
          name: matchedDepName,
          version: pinnedVersion,
          versionAccuracy: VersionAccuracy.PackageJSONPinned,
        }
      }

      // Coerce to parse syntax like ~0.1.2 or ^1.2.3
      const coercedVersion = parse(coerce(matchedDepVersion)) || undefined
      if (coercedVersion) {
        return {
          name: matchedDepName,
          version: coercedVersion,
          versionAccuracy: VersionAccuracy.PackageJSON,
        }
      }

      return {
        name: matchedDepName,
        version: undefined,
        versionAccuracy: undefined,
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
  protected async detectConfigFile(configFiles: string[]): Promise<Detection | undefined> {
    if (configFiles.length) {
      const config = await this.project.fs.findUp(configFiles, {
        cwd: this.path || this.project.baseDirectory,
        stopAt: this.project.root,
      })

      if (config) {
        return {
          // Have higher trust on a detection of a config file if there is no npm dependency specified for this framework
          // otherwise the npm dependency should have already triggered the detection
          accuracy: this.npmDependencies.length === 0 ? Accuracy.ConfigOnly : Accuracy.Config,
          config,
          configName: this.project.fs.basename(config),
        }
      }
    }
  }

  /**
   * Checks if the project is using a specific framework:
   * - if `npmDependencies` is set, one of them must be present in the `package.json` `dependencies|devDependencies`
   * - if `excludedNpmDependencies` is set, none of them must be present in the `package.json` `dependencies|devDependencies`
   * - if `configFiles` is set, one of the files must exist
   */
  async detect(): Promise<DetectedFramework | undefined> {
    const npm = await this.detectNpmDependency()
    const config = await this.detectConfigFile(this.configFiles ?? [])
    this.detected = mergeDetections([
      // we can force frameworks as well
      this.detected?.accuracy === Accuracy.Forced ? this.detected : undefined,
      npm,
      config,
    ])

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

  getBuildCommands() {
    const buildCommands = getBuildCommands(
      this.build.command,
      this.detected?.packageJSON?.scripts as Record<string, string>,
    )
    if (buildCommands.length > 0) {
      return buildCommands.map((command) => this.project.getNpmScriptCommand(command))
    }

    return [this.build.command]
  }

  /** This method will be called by the JSON.stringify */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      package: {
        name: this.detected?.package?.name || this.npmDependencies?.[0],
        version: this.detected?.package?.version?.raw || 'unknown',
        versionAccuracy: this.detected?.package?.versionAccuracy,
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
