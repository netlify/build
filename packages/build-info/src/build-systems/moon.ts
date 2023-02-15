import { Project } from '../project.js'

import { BaseBuildTool } from './build-system.js'

export class Moon extends BaseBuildTool {
  id = 'moon'
  name = 'MoonRepo'
  configFiles = ['.moon']

  async detect(project: Project) {
    const config = await project.fs.findUp(this.configFiles, {
      cwd: project.baseDirectory,
      type: 'directory',
      stopAt: project.root,
    })

    if (config) {
      const pkgJson = await project.getPackageJSON(config)
      this.version = pkgJson.devDependencies?.[this.id]
      return this
    }
  }
}
