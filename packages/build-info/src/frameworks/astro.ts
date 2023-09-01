import { lt } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Astro extends BaseFramework implements Framework {
  readonly id = 'astro'
  name = 'Astro'
  configFiles = ['astro.config.mjs']
  npmDependencies = ['astro']
  category = Category.SSG
  staticAssetsDirectory = 'public'

  dev = {
    port: 4321,
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
      // Less than 3.x.x. uses port 3000
      if (this.version && lt(this.version, '3.0.0')) {
        this.dev.port = 3000
      }

      return this as DetectedFramework
    }
  }
}
