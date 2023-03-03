import { PollingStrategy } from '../frameworks/framework.js'
import { Project } from '../project.js'

export type Command = {
  type: 'build' | 'dev' | 'unknown'
  command: string
}

export interface BuildSystem {
  id: string
  name: string
  project: Project
  version?: string

  build?: {
    command: string
    directory?: string
  }

  dev?: {
    command: string
    port?: number
    pollingStrategies?: PollingStrategy[]
  }

  getCommands(path: string): Promise<Command[]>

  detect(): Promise<BuildSystem | undefined>
}

export abstract class BaseBuildTool {
  id: string
  name: string
  version?: string
  configFiles: string[] = []

  constructor(public project: Project) {}

  async detect(): Promise<this | undefined> {
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
    return {
      id: this.id,
      name: this.name,
      version: this.version,
    }
  }
}
