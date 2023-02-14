import { Project } from '../project.js'

import { BaseBuildTool } from './build-system.js'

export class Gradle extends BaseBuildTool {
  id = 'gradle'
  name = 'Gradle'
  configFiles = ['build.gradle']

  async detect(project: Project) {
    const config = await project.fs.findUp(this.configFiles, { cwd: project.baseDirectory })

    if (config) {
      return this
    }
  }
}
