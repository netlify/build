import { BaseBuildTool } from './build-system.js'

export class Pants extends BaseBuildTool {
  id = 'pants'
  name = 'Pants'
  configFiles = ['pants.toml']

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
