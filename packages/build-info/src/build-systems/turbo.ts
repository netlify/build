import type { PackageJson } from 'read-pkg'

import { BaseBuildTool, NPM_BUILD_SCRIPTS, type Command, NPM_DEV_SCRIPTS } from './build-system.js'

export class Turbo extends BaseBuildTool {
  id = 'turbo'
  name = 'TurboRepo'
  configFiles = ['turbo.json']
  runFromRoot = true

  /** Retrieves a list of possible commands for a package */
  async getCommands(packagePath: string): Promise<Command[]> {
    const { scripts, name } = await this.project.fs.readJSON<PackageJson>(
      this.project.fs.join(packagePath, 'package.json'),
    )

    if (name && scripts && Object.values(scripts).length) {
      return Object.keys(scripts).map((target) => {
        let type: Command['type'] = 'unknown'

        if (NPM_DEV_SCRIPTS.includes(target)) {
          type = 'dev'
        }

        if (NPM_BUILD_SCRIPTS.includes(target)) {
          type = 'build'
        }

        return {
          type,
          command: `turbo run ${target} --scope ${name}`,
        }
      })
    }
    return []
  }
}
