import { gte } from 'semver'

import { BaseFramework, Category, Framework } from './framework.js'

export class Next extends BaseFramework implements Framework {
  id = 'next'
  name = 'Next.js'
  category = Category.FrontendFramework
  npmDependencies = ['next']

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

  async detect()
  async detect(): Promise<this | undefined> {
    const detected = await super.detect()

    if (detected) {
      const nodeVersion = await this.project.getCurrentNodeVersion()
      if (nodeVersion && gte(nodeVersion, '10.13.0')) {
        this.plugins.push('@netlify/plugin-nextjs')
      }
      return this
    }
  }
}
