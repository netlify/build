import { gte } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Astro extends BaseFramework implements Framework {
  readonly id = 'astro'
  name = 'Astro'
  configFiles = ['astro.config.mjs']
  npmDependencies = ['astro']
  category = Category.SSG
  staticAssetsDirectory = 'public'

  dev = {
    port: 3000,
    command: 'astro dev',
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'astro build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/astro/light.svg',
    light: '/logos/astro/light.svg',
    dark: '/logos/astro/dark.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      if (this.version && gte(this.version, '3.0.0')) {
        this.dev.port = 4321
      }

      return this as DetectedFramework
    }
  }
}
