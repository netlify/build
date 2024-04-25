import { BaseBuildTool } from './build-system.js'

export class Bazel extends BaseBuildTool {
  id = 'bazel'
  name = 'Bazel'
  configFiles = ['.bazelrc', 'WORKSPACE', 'WORKSPACE.bazel', 'BUILD.bazel']

  async detect() {
    const config = await this.project.fs.findUp(this.configFiles, {
      cwd: this.project.baseDirectory,
      stopAt: this.project.root,
    })

    if (config) {
      return this
    }
  }
}
