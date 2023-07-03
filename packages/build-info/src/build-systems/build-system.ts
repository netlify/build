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
  /** If the command should be executed from the repository root */
  runFromRoot?: boolean

  /** A function that can be implemented to override the dev and build commands of a framework like `nx run ...` */
  getCommands?(path: string): Promise<Command[]>
  /** A function that can be implemented to override the dist location of a framework */
  getDist?(path: string): Promise<string>
  /** The detect function that is called to check if this build system is in use */
  detect(): Promise<BuildSystem | undefined>
}

export abstract class BaseBuildTool {
  id: string
  name: string
  version?: string
  configFiles: string[] = []
  /** If the command should be executed from the repository root */
  runFromRoot?: boolean

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
