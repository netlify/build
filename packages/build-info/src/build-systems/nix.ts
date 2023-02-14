import { Project } from '../project.js'

import { BaseBuildTool } from './build-system.js'

export class Nix extends BaseBuildTool {
  id = 'nix'
  name = 'Nix'
  configFiles = ['default.nix', 'shell.nix', 'release.nix']

  async detect(project: Project) {
    const config = await project.fs.findUp(this.configFiles, { cwd: project.baseDirectory })

    if (config) {
      return this
    }
  }
}
