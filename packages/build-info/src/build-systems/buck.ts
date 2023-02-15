import { Project } from '../project.js'

import { BaseBuildTool } from './build-system.js'

export class Buck extends BaseBuildTool {
  id = 'buck'
  name = 'Buck'
  configFiles = ['.buckconfig', 'BUCK']

  async detect(project: Project) {
    const config = await project.fs.findUp(this.configFiles, { cwd: project.baseDirectory, stopAt: project.root })

    if (config) {
      return this
    }
  }
}
