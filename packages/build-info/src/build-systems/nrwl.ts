import { NPM_BUILD_SCRIPTS, NPM_DEV_SCRIPTS } from '../get-commands.js'
import { WorkspaceInfo, WorkspacePackage } from '../workspaces/detect-workspace.js'
import { findPackages, identifyPackageFn } from '../workspaces/get-workspace-packages.js'

import { BaseBuildTool, type Command } from './build-system.js'
export class Nx extends BaseBuildTool {
  id = 'nx'
  name = 'Nx'
  configFiles = ['nx.json']
  runFromRoot = true

  /** Retrieves a list of possible commands for a package */
  async getCommands(packagePath: string): Promise<Command[]> {
    const projectPath =
      this.project.baseDirectory.endsWith(packagePath) && !this.project.workspace?.isRoot
        ? this.project.fs.join(this.project.baseDirectory, 'project.json')
        : this.project.fs.resolve(packagePath, 'project.json')
    const { name, targets } = await this.project.fs.readJSON(projectPath)

    if (name && targets) {
      return Object.keys(targets).map((target) => {
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
              if (entry === 'project.json') {
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
}
