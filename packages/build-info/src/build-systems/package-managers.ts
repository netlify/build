import { isNpmBuildScript, isNpmDevScript } from '../get-commands.js'
import { PkgManager } from '../package-managers/detect-package-manager.js'

import { BaseBuildTool, Command } from './build-system.js'

export class PNPM extends BaseBuildTool {
  id = 'pnpm'
  name = 'PNPM'
  runFromRoot = true

  // will be called after the framework detection has run
  async getCommands(packagePath: string): Promise<Command[]> {
    const { name, scripts } = await this.project.fs.readJSON(
      this.project.resolveFromPackage(packagePath, 'package.json'),
    )
    if (scripts && Object.keys(scripts).length > 0) {
      return Object.entries(scripts).map(([scriptName, value]) => ({
        type: isNpmDevScript(scriptName, value) ? 'dev' : isNpmBuildScript(scriptName, value) ? 'build' : 'unknown',
        command: `pnpm run ${scriptName} --filter ${name}`,
      }))
    }
    return []
  }
  async detect(): Promise<this | undefined> {
    if (this.project.workspace && this.project.packageManager?.name === PkgManager.PNPM) {
      return this
    }
  }
}

export class Yarn extends BaseBuildTool {
  id = 'yarn'
  name = 'Yarn'
  runFromRoot = true

  // will be called after the framework detection has run
  async getCommands(packagePath: string): Promise<Command[]> {
    const { name, scripts } = await this.project.fs.readJSON(
      this.project.resolveFromPackage(packagePath, 'package.json'),
    )
    if (scripts && Object.keys(scripts).length > 0) {
      return Object.entries(scripts).map(([scriptName, value]) => ({
        type: isNpmDevScript(scriptName, value) ? 'dev' : isNpmBuildScript(scriptName, value) ? 'build' : 'unknown',
        command: `yarn workspace ${name} ${scriptName}`,
      }))
    }
    return []
  }

  async detect(): Promise<this | undefined> {
    if (this.project.workspace && this.project.packageManager?.name === PkgManager.YARN) {
      return this
    }
  }
}

export class NPM extends BaseBuildTool {
  id = 'npm'
  name = 'NPM'
  runFromRoot = true

  // will be called after the framework detection has run
  async getCommands(packagePath: string): Promise<Command[]> {
    const { name, scripts } = await this.project.fs.readJSON(
      this.project.resolveFromPackage(packagePath, 'package.json'),
    )
    if (scripts && Object.keys(scripts).length > 0) {
      return Object.entries(scripts).map(([scriptName, value]) => ({
        type: isNpmDevScript(scriptName, value) ? 'dev' : isNpmBuildScript(scriptName, value) ? 'build' : 'unknown',
        command: `npm run ${scriptName} --workspace ${name}`,
      }))
    }
    return []
  }

  async detect(): Promise<this | undefined> {
    if (this.project.workspace && this.project.packageManager?.name === PkgManager.NPM) {
      return this
    }
  }
}
