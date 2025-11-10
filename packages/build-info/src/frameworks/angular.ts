import { env } from 'node:process'
import { gte } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Angular extends BaseFramework implements Framework {
  readonly id = 'angular'
  name = 'Angular'
  configFiles = ['angular.json']
  npmDependencies = ['@angular/cli']
  excludedNpmDependencies = ['@analogjs/platform']
  category = Category.FrontendFramework

  dev = {
    port: 4200,
    command: 'ng serve',
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'ng build --prod',
    directory: 'dist/',
  }

  logo = {
    default: '/logos/angular/default.svg',
    light: '/logos/angular/default.svg',
    dark: '/logos/angular/default.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()
    const skipRuntime = env['NETLIFY_ANGULAR_RUNTIME_SKIP']
    
    if (this.detected) {
      if (this.version && gte(this.version, '17.0.0-rc')) {
        if (skipRuntime !== '1' && skipRuntime !== 'true') {
          this.plugins.push('@netlify/angular-runtime')
        } 
        const angularJson = await this.project.fs.gracefullyReadFile('angular.json')
        if (angularJson) {
          const { projects, defaultProject } = JSON.parse(angularJson)
          const project = projects[defaultProject ?? Object.keys(projects)[0]]
          const outputPath = project?.architect?.build?.options?.outputPath
          if (outputPath) {
            const usesApplicationBuilder = project?.architect?.build?.builder?.endsWith(':application')
            this.build.directory = usesApplicationBuilder ? this.project.fs.join(outputPath, 'browser') : outputPath
          }
        }
      }
      return this as DetectedFramework
    }
  }
}
