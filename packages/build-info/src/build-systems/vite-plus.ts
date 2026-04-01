import { isNpmBuildScript, isNpmDevScript } from '../get-commands.js'

import { BaseBuildTool, type Command } from './build-system.js'

export class VitePlus extends BaseBuildTool {
  id = 'vite-plus'
  name = 'Vite+'

  async detect(): Promise<this | undefined> {
    const pkgJsonPath = await this.project.fs.findUp('package.json', {
      cwd: this.project.baseDirectory,
      stopAt: this.project.root,
    })
    if (pkgJsonPath) {
      const pkg = await this.project.fs.readJSON<Record<string, Record<string, string>>>(pkgJsonPath)
      if (pkg.dependencies?.['vite-plus'] || pkg.devDependencies?.['vite-plus']) {
        this.version = pkg.devDependencies?.['vite-plus'] || pkg.dependencies?.['vite-plus']
        return this
      }
    }
  }

  async getCommands(packagePath: string): Promise<Command[]> {
    const { scripts } = await this.project.fs.readJSON<Record<string, Record<string, string>>>(
      this.project.resolveFromPackage(packagePath, 'package.json'),
    )

    if (scripts && Object.keys(scripts).length > 0) {
      return Object.entries(scripts).map(([scriptName, value]) => ({
        type: isNpmDevScript(scriptName, value) ? 'dev' : isNpmBuildScript(scriptName, value) ? 'build' : 'unknown',
        command: `vp run ${scriptName}`,
      }))
    }
    return []
  }
}
