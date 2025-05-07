import { Project } from '../project.js'

export abstract class LangRuntime {
  id: string
  name: string

  configFiles: string[] = []

  constructor(public project: Project) {}

  async detect(): Promise<this | undefined> {
    const config = await this.project.fs.findUp(this.configFiles, {
      cwd: this.project.baseDirectory,
      stopAt: this.project.root,
    })

    if (config) {
      return this
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
    }
  }
}
