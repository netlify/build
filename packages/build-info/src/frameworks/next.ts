import { gte } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Next extends BaseFramework implements Framework {
  readonly id = 'next'
  name = 'Next.js'
  category = Category.SSG
  npmDependencies = ['next']
  excludedNpmDependencies = ['@nrwl/next']
  configFiles = ['next.config.js', 'next.config.mjs']

  dev = {
    command: 'next',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'next build',
    directory: '.next',
  }

  logo = {
    default: '/logos/nextjs/light.svg',
    light: '/logos/nextjs/light.svg',
    dark: '/logos/nextjs/dark.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      const nodeVersion = await this.project.getCurrentNodeVersion()
      const runtimeFromRollout = this.project.featureFlags['project_ceruledge_ui']
      if (
        nodeVersion &&
        gte(nodeVersion, '18.0.0') &&
        this.detected.package?.version &&
        gte(this.detected.package.version, '13.5.0') &&
        typeof runtimeFromRollout === 'string'
      ) {
        this.plugins.push({ name: runtimeFromRollout ?? '@netlify/plugin-nextjs', autoInstall: true })
      } else if (nodeVersion && gte(nodeVersion, '10.13.0')) {
        this.plugins.push({ name: '@netlify/plugin-nextjs', autoInstall: true })
      }
      return this as DetectedFramework
    }
  }
}
