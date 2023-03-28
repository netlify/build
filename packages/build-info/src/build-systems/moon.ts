import { BaseBuildTool } from './build-system.js'

export class Moon extends BaseBuildTool {
  id = 'moon'
  name = 'MoonRepo'
  configFiles = ['.moon']

  async detect() {
    const config = await this.project.fs.findUp(this.configFiles, {
      cwd: this.project.baseDirectory,
      type: 'directory',
      stopAt: this.project.root,
    })

    if (config) {
      const pkgJson = await this.project.getPackageJSON(config)
      this.version = pkgJson.devDependencies?.[this.id]
      return this
    }
  }
}
