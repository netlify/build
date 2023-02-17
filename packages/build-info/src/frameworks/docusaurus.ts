import { Project } from '../project.js'

import { BaseFramework, Category, Framework } from './framework.js'

export class Docusaurus extends BaseFramework implements Framework {
  id = 'docusaurus'
  name = 'Docusaurus'
  configFiles = [
    'docusaurus.config.js', // v2
    'siteConfig.js', // v1
  ]
  npmDependencies = [
    '@docusaurus/core', // v2
    'docusaurus', // v1
  ]
  category = Category.SSG
  staticAssetsDirectory = 'static'

  dev = {
    command: 'docusaurus start',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'docusaurus build',
    directory: 'build',
  }

  logo = {
    default: '/logos/docusaurus/default.svg',
    light: '/logos/docusaurus/default.svg',
    dark: '/logos/docusaurus/default.svg',
  }

  env = { BROWSER: 'none' }

  async detect(project: Project)
  async detect(project: Project): Promise<this | undefined> {
    const detected = await super.detect(project, true)

    if (detected) {
      if (this.isV1(detected)) {
        this.build.command = 'docusaurus-build'
        this.build.directory = 'build/<project-name>'

        this.dev.command = 'docusaurus-start'
      }

      return this
    }
  }

  isV1(detected: { npmDependency?: string; config?: string }) {
    return detected.config?.endsWith('siteConfig.js') || detected.npmDependency === 'docusaurus'
  }
}
