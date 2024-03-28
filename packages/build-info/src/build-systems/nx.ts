import type { PackageJson } from 'read-pkg'

import { FrameworkName } from '../frameworks/index.js'
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
    const target = this.targets.get(packagePath)?.find((t) => NPM_DEV_SCRIPTS.includes(t.name))
    const executor = this.getExecutorFromTarget(target)
    if (!executor) {
      return null
    }

    switch (executor) {
      case '@nxtensions/astro:dev':
        return 3000
      case '@nx/next:server':
      case '@nrwl/next:server':
      case '@nrwl/web:dev-server':
      case '@nx/webpack:dev-server':
      case '@angular-devkit/build-angular:dev-server':
        return 4200
      case '@nx-plus/vue:dev-server':
        return 8000
      // some targets like run command don't have an executor
      case 'nx:run-commands':
      case undefined:
        return null
      default:
        this.project.report(
          {
            name: 'UndetectedExecutor',
            message: `Undetected executor for Nx integrated: ${executor}`,
          },
          {
            metadata: { executor },
          },
        )
        return null
    }
  }

  private async getOutputFromTarget(packagePath: string): Promise<string | null> {
    // dynamic import out of performance reasons on the react UI
    const { getProperty } = await import('dot-prop')
    try {
      const target = this.targets.get(packagePath)?.find((t) => t.name === 'build')
      if (target) {
        const pattern = 'outputs' in target ? target.outputs?.[0] : target.options?.outputPath
        if (pattern) {
          const framework = this.project.frameworks?.get(packagePath)?.[0]
          let frameworkDist = ''

          // for next we still want to get the .next directory on the framework dist path
          if (framework?.id === 'next') {
            frameworkDist = framework.build.directory
          }

          return this.project.fs.join(
            pattern
              .replace('{workspaceRoot}/', '')
              .replace(/\{(.+)\}/g, (_match, group) => getProperty({ ...target, projectRoot: packagePath }, group)),
            frameworkDist,
          )
        }
      }
    } catch {
      //noop
    }

    // As a fallback use the convention of the dist combined with the package path
    return this.project.fs.join('dist', packagePath)
  }

  private getExecutorFromTarget(target?: Target): string | undefined {
    return target && ('executor' in target ? target.executor : target.builder)
  }

  /** Detects a framework through the executor field in a target */
  private async detectFramework(targets: Target[]): Promise<FrameworkName | undefined> {
    const target = targets.find((t) => NPM_BUILD_SCRIPTS.includes(t.name))
    const executor = this.getExecutorFromTarget(target)
    if (!target || !executor) {
      return
    }

    switch (executor) {
      case '@nrwl/next:build':
      case '@nx/next:build':
        return 'next'
      case '@nxtensions/astro:build':
        return 'astro'
      case '@nx-plus/vue:browser':
        return 'vue'
      case '@angular-devkit/build-angular:browser':
        return 'angular'
      case '@nx/webpack:webpack':
      case '@nrwl/web:build':
        if (target.options?.webpackConfig?.includes?.('react')) {
          return 'react-static'
        }
        this.project.report({
          name: 'UndetectedNrwlWeb',
          message: `Undetected @nrwl/web:build framework: ${JSON.stringify({ target }, null, 2)}`,
        })
        // TODO: once we add webpack return here 'webpack'
        // https://github.com/netlify/build/issues/5185
        return
      // Non Supported builders that are not deployable
      case '@nx/cypress:cypress':
      case '@nrwl/cypress:cypress':
      case '@nrwl/node:build':
        return
      case 'nx:run-commands':
      case undefined:
        // some targets like run command don't have an executor
        return
      default:
        this.project.report(
          {
            name: 'UndetectedExecutor',
            message: `Undetected executor for Nx integrated: ${executor}`,
          },
          {
            metadata: { executor },
          },
        )
    }
  }

  /** detect workspace packages with the workspace.json file */
  private async detectWorkspaceFile(): Promise<WorkspacePackage[]> {
    const fs = this.project.fs
    try {
      const { projects } = await fs.readJSON<WorkspaceJson>(fs.join(this.project.jsWorkspaceRoot, 'workspace.json'), {
        fail: true,
      })
      const pkgs: WorkspacePackage[] = []
      for (const [key, { root, projectType, architect }] of Object.entries(projects || {})) {
        if (!root || key.endsWith('-e2e') || projectType !== 'application') {
          continue
        }
        const targets = Object.entries(architect || {}).map(([name, target]) => ({ ...target, name }))
        const forcedFramework = await this.detectFramework(targets)
        this.targets.set(fs.join(root), targets)

        pkgs.push({ name: key, path: fs.join(root), forcedFramework })
      }
      return pkgs
    } catch {
      // noop
    }
    return []
  }

  /** detect workspace packages with the project.json files */
  private async detectProjectJson(): Promise<WorkspacePackage[]> {
    const fs = this.project.fs
    try {
      const { workspaceLayout } = await fs.readJSON<any>(fs.join(this.project.jsWorkspaceRoot, 'nx.json'), {
        fail: true,
      })
      const appDirs = workspaceLayout?.appsDir ? [workspaceLayout.appsDir] : ['apps', 'packages']
      const identifyPkg: identifyPackageFn = async ({ entry, directory, packagePath }) => {
        // ignore e2e test applications as there is no need to deploy them
        if (entry === 'project.json' && !packagePath.endsWith('-e2e')) {
          try {
            // we need to check the project json for application types (we don't care about libraries)
            const { projectType, name, targets } = await fs.readJSON(fs.join(directory, entry))
            if (projectType === 'application') {
              const targetsWithName = Object.entries(targets || {}).map(([name, target]) => ({ ...target, name }))
              const forcedFramework = await this.detectFramework(targetsWithName)
              this.targets.set(fs.join(packagePath), targetsWithName)
              return { name, path: fs.join(packagePath), forcedFramework } as WorkspacePackage
            }
          } catch {
            // noop
          }
        }
        return null
      }

      const pkgs = await Promise.all(
        appDirs.map(async (appDir) =>
          findPackages(
            this.project,
            appDir,
            identifyPkg,
            '*', // only check for one level
          ).catch(() => []),
        ),
      )

      return pkgs.flat()
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
