import type { PackageJson } from 'read-pkg'

import { NPM_BUILD_SCRIPTS, NPM_DEV_SCRIPTS } from '../get-commands.js'
import { WorkspaceInfo, WorkspacePackage } from '../workspaces/detect-workspace.js'
import { findPackages, identifyPackageFn } from '../workspaces/get-workspace-packages.js'

import { BaseBuildTool, type Command } from './build-system.js'

type WorkspaceJson = {
  projects: Record<string, WorkspaceJsonProject>
}

type WorkspaceJsonProject = {
  root: string
  sourceRoot: string
  projectType: 'application' | 'library'
  schematics: Record<string, unknown>
  architect: Record<string, Omit<WorkspaceJsonTarget, 'name'>>
}

type Target = WorkspaceJsonTarget | ProjectJsonTarget

type WorkspaceJsonTarget = {
  /** will be manually set */
  name: string
  builder: string
  options?: Record<string, any>
  configurations?: Record<string, any>
}

type ProjectJsonTarget = {
  /** will be manually set */
  name: string
  executor: string
  outputs?: string[]
  options?: Record<string, any>
  defaultConfiguration?: string
  configurations?: Record<string, any>
}

export class Nx extends BaseBuildTool {
  id = 'nx'
  name = 'Nx'
  configFiles = ['nx.json']
  logo = {
    default: '/logos/nx/light.svg',
    light: '/logos/nx/light.svg',
    dark: '/logos/nx/dark.svg',
  }
  runFromRoot = true
  /**
   * if it's an nx integrated setup
   * We need to differentiate as the 'dist' folder is located differently
   * @see https://nx.dev/concepts/integrated-vs-package-based
   */
  isIntegrated = false
  /** List of target patterns */
  targets = new Map<string, Target[]>()

  /** Retrieves a list of possible commands for a package */
  async getCommands(packagePath: string): Promise<Command[]> {
    let name = this.project.workspace?.getPackage(packagePath)?.name || ''
    const targets = this.targets.get(packagePath) || []
    const targetNames = targets.map((t) => t.name)

    // it can be a mix of integrated and package based
    try {
      const packageJSONPath = this.project.resolveFromPackage(packagePath, 'package.json')
      const json = await this.project.fs.readJSON<PackageJson>(packageJSONPath, { fail: true })
      targetNames.push(...Object.keys(json?.scripts || {}))
      name = json.name || ''
    } catch {
      // noop
    }

    if (name.length !== 0 && targetNames.length !== 0) {
      return targetNames.map((target) => {
        let type: Command['type'] = 'unknown'

        if (NPM_DEV_SCRIPTS.includes(target)) {
          type = 'dev'
        }

        if (NPM_BUILD_SCRIPTS.includes(target)) {
          type = 'build'
        }

        return {
          type,
          command: `nx run ${name}:${target}`,
        }
      })
    }
    return []
  }

  /** Retrieve the dist directory of a package */
  async getDist(packagePath: string): Promise<string | null> {
    // only nx integrated has the `project.json`
    if (!this.isIntegrated) {
      return null
    }

    return this.getOutputFromTarget(packagePath)
  }

  /** Retrieve the overridden port of the nx executor for integrated setups */
  async getPort(packagePath: string): Promise<number | null> {
    // only nx integrated has the `project.json`
    if (!this.isIntegrated) {
      return null
    }
    const targets = this.targets.get(packagePath)?.filter((t) => NPM_DEV_SCRIPTS.includes(t.name)) || []
    const executor = targets[0] && ('executor' in targets[0] ? targets[0].executor : targets[0].builder)

    switch (executor) {
      case '@nxtensions/astro:dev':
        return 3000
      case '@nrwl/next:server':
      case '@nx/webpack:dev-server':
      case '@angular-devkit/build-angular:dev-server':
        return 4200
      case '@nx-plus/vue:dev-server':
        return 8000
      default:
        this.project.report({
          name: 'UndetectedExecutor',
          message: `Undetected executor for Nx integrated: ${executor}`,
        })
        return null
    }
  }

  async getOutputFromTarget(packagePath: string): Promise<string | null> {
    // dynamic import out of performance reasons on the react UI
    const { getProperty } = await import('dot-prop')
    try {
      const target = this.targets.get(packagePath)?.find((t) => t.name === 'build')
      if (target) {
        const pattern = 'outputs' in target ? target.outputs?.[0] : target.options?.outputPath
        if (pattern) {
          return this.project.fs.join(
            pattern
              .replace('{workspaceRoot}/', '')
              .replace(/\{(.+)\}/g, (_match, group) => getProperty({ ...target, projectRoot: packagePath }, group)),
          )
        }
      }
    } catch {
      //noop
    }

    // As a fallback use the convention of the dist combined with the package path
    return this.project.fs.join('dist', packagePath)
  }

  /** detect workspace packages with the workspace.json file */
  async detectWorkspaceFile(): Promise<WorkspacePackage[]> {
    const fs = this.project.fs
    try {
      const { projects } = await fs.readJSON<WorkspaceJson>(fs.join(this.project.jsWorkspaceRoot, 'workspace.json'), {
        fail: true,
      })
      return Object.entries(projects || {})
        .map(([key, { root, projectType, architect }]) => {
          if (!root || key.endsWith('-e2e') || projectType !== 'application') {
            return
          }
          this.targets.set(
            root,
            Object.entries(architect || {}).map(([name, target]) => ({ ...target, name })),
          )
          return { name: key, path: root } as WorkspacePackage
        })
        .filter(Boolean) as WorkspacePackage[]
    } catch {
      // noop
    }
    return []
  }

  /** detect workspace pacakges with the project.json files */
  async detectProjectJson(): Promise<WorkspacePackage[]> {
    const fs = this.project.fs
    try {
      const { workspaceLayout = { appsDir: 'apps' } } = await fs.readJSON<any>(
        fs.join(this.project.jsWorkspaceRoot, 'nx.json'),
        {
          fail: true,
        },
      )
      // if an apps dir is specified get it.
      if (workspaceLayout?.appsDir?.length) {
        const identifyPkg: identifyPackageFn = async ({ entry, directory, packagePath }) => {
          // ignore e2e test applications as there is no need to deploy them
          if (entry === 'project.json' && !packagePath.endsWith('-e2e')) {
            try {
              // we need to check the project json for application types (we don't care about libraries)
              const { projectType, name, targets } = await fs.readJSON(fs.join(directory, entry))
              if (projectType === 'application') {
                this.targets.set(
                  packagePath,
                  Object.entries(targets || {}).map(([name, target]) => ({ ...target, name })),
                )
                return { name, path: packagePath } as WorkspacePackage
              }
            } catch {
              // noop
            }
          }
          return null
        }

        return findPackages(
          this.project,
          workspaceLayout.appsDir,
          identifyPkg,
          '*', // only check for one level
        )
      }
    } catch {
      // noop
    }
    return []
  }

  async detect(): Promise<this | undefined> {
    const detected = await super.detect()
    if (detected) {
      const pkgs = [...(await this.detectWorkspaceFile()), ...(await this.detectProjectJson())]

      if (pkgs.length) {
        // in this case it's an integrated setup
        this.isIntegrated = true

        if (!this.project.workspace) {
          this.project.workspace = new WorkspaceInfo()
          this.project.workspace.isRoot = this.project.jsWorkspaceRoot === this.project.baseDirectory
          this.project.workspace.rootDir = this.project.jsWorkspaceRoot
          this.project.workspace.packages = pkgs
        } else {
          this.project.workspace.packages.push(...pkgs)
        }

        this.project.events.emit('detectWorkspaces', this.project.workspace)
      }
      return this
    }
  }
}
