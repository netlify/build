import { gte } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Next extends BaseFramework implements Framework {
  readonly id = 'next'
  name = 'Next.js'
  category = Category.SSG
  npmDependencies = ['next']
  excludedNpmDependencies = ['@nrwl/next']
  configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts']

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
      if (nodeVersion && gte(nodeVersion, '10.13.0') && !process.env.NETLIFY_NEXT_PLUGIN_SKIP) {
        this.plugins.push('@netlify/plugin-nextjs')
      }
      return this as DetectedFramework
    }
  }
}
