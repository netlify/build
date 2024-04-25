import { BaseBuildTool } from './build-system.js'

export class Nix extends BaseBuildTool {
  id = 'nix'
  name = 'Nix'
  configFiles = ['default.nix', 'shell.nix', 'release.nix']

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
