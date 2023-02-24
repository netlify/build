import { PollingStrategy } from '../frameworks/framework.js'
import { Project } from '../project.js'

export interface BuildSystem {
  id: string
  name: string
  project: Project
  version?: string

  dev?: {
    command: string
    port?: number
    pollingStrategies?: PollingStrategy[]
  }

  detect(): Promise<BuildSystem | undefined>
}

export abstract class BaseBuildTool implements BuildSystem {
  id: string
  name: string
  version?: string
  configFiles: string[] = []

  constructor(public project: Project) {}

  async detect() {
    const config = await this.project.fs.findUp(this.configFiles, {
      cwd: this.project.baseDirectory,
      stopAt: this.project.root,
    })

    if (config) {
      const pkgJson = await this.project.getPackageJSON(this.project.fs.dirname(config))
      this.version = pkgJson.devDependencies?.[this.id]
      return this
    }
  }

  /** Get's a JSON from the class information */
  toJSON() {
    return { id: this.id, name: this.name, version: this.version }
  }
}
