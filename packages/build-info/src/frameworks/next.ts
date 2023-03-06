import { gte } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Next extends BaseFramework implements Framework {
  id = 'next'
  name = 'Next.js'
  category = Category.SSG
  npmDependencies = ['next']
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
      if (nodeVersion && gte(nodeVersion, '10.13.0')) {
        this.plugins.push('@netlify/plugin-nextjs')
      }
      return this as DetectedFramework
    }
  }
}

/**
 * @deprecated to keep the same behavior as previously and do not break anything.
 * Remove once the build system detection is fully combined with the framework detection.
 */
export class NextNx extends BaseFramework implements Framework {
  id = 'next-nx'
  name = 'Next.js with Nx'
  category = Category.SSG
  npmDependencies = ['@nrwl/next']

  dev = {
    command: 'nx serve',
    port: 4200,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'nx build',
    directory: 'dist/apps/<app name>/.next',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      const nodeVersion = await this.project.getCurrentNodeVersion()
      if (nodeVersion && gte(nodeVersion, '10.13.0')) {
        this.plugins.push('@netlify/plugin-nextjs')
      }
      return this as DetectedFramework
    }
  }
}
