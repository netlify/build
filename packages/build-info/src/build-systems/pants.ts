import { Project } from '../project.js'

import { BaseBuildTool } from './build-system.js'

export class Pants extends BaseBuildTool {
  id = 'pants'
  name = 'Pants'
  configFiles = ['pants.toml']

  async detect(project: Project) {
    const config = await project.fs.findUp(this.configFiles, { cwd: project.baseDirectory, stopAt: project.root })

    if (config) {
      return this
    }
  }
}
