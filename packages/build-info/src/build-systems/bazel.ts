import { Project } from '../project.js'

import { BaseBuildTool } from './build-system.js'

export class Bazel extends BaseBuildTool {
  id = 'bazel'
  name = 'Bazel'
  configFiles = ['.bazelrc', 'WORKSPACE', 'WORKSPACE.bazel', 'BUILD.bazel']

  async detect(project: Project) {
    const config = await project.fs.findUp(this.configFiles, { cwd: project.baseDirectory, stopAt: project.root })

    if (config) {
      return this
    }
  }
}
