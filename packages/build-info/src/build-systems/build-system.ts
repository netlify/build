import { Project } from '../project.js'

export interface BuildSystem {
  id: string
  name: string
  version?: string

  detect(project: Project): Promise<BuildSystem | undefined>
}

export abstract class BaseBuildTool implements BuildSystem {
  id: string
  name: string
  version?: string
  configFiles: string[] = []

  async detect(project: Project) {
    const config = await project.fs.findUp(this.configFiles, { cwd: project.baseDirectory, stopAt: project.root })

    if (config) {
      const pkgJson = await project.getPackageJSON(project.fs.dirname(config))
      this.version = pkgJson.devDependencies?.[this.id]
      return this
    }
  }

  /** Get's a JSON from the class information */
  toJSON() {
    return { id: this.id, name: this.name, version: this.version }
  }
}
