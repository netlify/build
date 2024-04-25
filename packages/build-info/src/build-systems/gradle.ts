import { BaseBuildTool } from './build-system.js'

export class Gradle extends BaseBuildTool {
  id = 'gradle'
  name = 'Gradle'
  configFiles = ['build.gradle']

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
