import type { PackageJson } from 'read-pkg'

import { NPM_BUILD_SCRIPTS, NPM_DEV_SCRIPTS } from '../get-commands.js'
import { WorkspaceInfo, WorkspacePackage } from '../workspaces/detect-workspace.js'
import { findPackages, identifyPackageFn } from '../workspaces/get-workspace-packages.js'

import { BaseBuildTool, type Command } from './build-system.js'

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

  /** Retrieves a list of possible commands for a package */
  async getCommands(packagePath: string): Promise<Command[]> {
    const projectPath = this.project.resolveFromPackage(packagePath, 'project.json')
    const packageJSONPath = this.project.resolveFromPackage(packagePath, 'package.json')
    let name: string
    const targets: string[] = []
    try {
      const project = await this.project.fs.readJSON(projectPath, { fail: true })
      this.isIntegrated = true
      targets.push(...Object.keys(project?.targets || {}))
      name = (project.name as string) || ''
    } catch {
      // if no project.json exists it's probably a package based nx workspace and not a integrated one
      const json = await this.project.fs.readJSON<PackageJson>(packageJSONPath)
      targets.push(...Object.keys(json?.scripts || {}))
      name = json.name || ''
    }

    if (name.length !== 0 && targets.length !== 0) {
      return targets.map((target) => {
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
    if (!this.isIntegrated) {
      return null
    }

    const framework = this.project.frameworks.get(packagePath)?.[0]

    if (framework) {
      const dist = framework.staticAssetsDirectory || framework.build.directory
      // TODO: make this smarter in the future by parsing the project.json
      return this.project.fs.join('dist', packagePath, dist)
    }

    return null
  }

  async detect(): Promise<this | undefined> {
    const detected = await super.detect()
    const fs = this.project.fs
    if (detected) {
      try {
        // in nx integrated setup the workspace is not managed through the package manager
        // in this case we have to check the `nx.json` for the project references
        if (this.project.workspace === null) {
          const { workspaceLayout } = await fs.readJSON<any>(fs.join(this.project.jsWorkspaceRoot, 'nx.json'))
          // if an apps dir is specified get it.
          if (workspaceLayout?.appsDir?.length) {
            const identifyPkg: identifyPackageFn = async ({ entry, directory, packagePath }) => {
              // ignore e2e test applications as there is no need to deploy them
              if (entry === 'project.json' && !packagePath.endsWith('-e2e')) {
                try {
                  // we need to check the project json for application types (we don't care about libraries)
                  const { projectType, name } = await fs.readJSON(fs.join(directory, entry))
                  if (projectType === 'application') {
                    return { name, path: packagePath } as WorkspacePackage
                  }
                } catch {
                  // noop
                }
              }
              return null
            }

            this.project.workspace = new WorkspaceInfo()
            this.project.workspace.isRoot = this.project.jsWorkspaceRoot === this.project.baseDirectory
            this.project.workspace.rootDir = this.project.jsWorkspaceRoot
            this.project.workspace.packages = await findPackages(
              this.project,
              workspaceLayout.appsDir,
              identifyPkg,
              '*', // only check for one level
            )
            this.project.events.emit('detectWorkspaces', this.project.workspace)
          }
        }
      } catch {
        // noop
      }
      return this
    }
  }
}

export class Lerna extends BaseBuildTool {
  id = 'lerna'
  name = 'Lerna'
  configFiles = ['lerna.json']
  logo = {
    default: '/logos/lerna/light.svg',
    light: '/logos/lerna/light.svg',
    dark: '/logos/lerna/dark.svg',
  }
}
