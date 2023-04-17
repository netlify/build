import { Project } from '../project.js'

export type Command = {
  type: 'build' | 'dev' | 'unknown'
  command: string
}

/** A list of often used dev command names to identify if the command is a dev command */
export const NPM_DEV_SCRIPTS = ['dev', 'serve', 'develop', 'start', 'run', 'web']

/** A list of often used build command names to identify if the command is a build command */
export const NPM_BUILD_SCRIPTS = ['build']

export interface BuildSystem {
  id: string
  name: string
  project: Project
  version?: string

  getCommands?(path: string): Promise<Command[]>
  getDist?(path: string): Promise<string>

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

  /** Gets a JSON from the class information */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
    }
  }
}
