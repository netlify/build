import { BaseFramework, Category, DetectedFramework, Detection, Framework } from './framework.js'

export class Docusaurus extends BaseFramework implements Framework {
  readonly id = 'docusaurus'
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
    pollingStrategies: [{ name: 'TCP' }],
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

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      if (this.isV1(this.detected)) {
        this.build.command = 'docusaurus-build'
        this.build.directory = 'build/<project-name>'

        this.dev.command = 'docusaurus-start'
      }

      return this as DetectedFramework
    }
  }

  isV1(detected: Detection) {
    return detected.config?.endsWith('siteConfig.js') || detected.package?.name === 'docusaurus'
  }
}
