import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Nuxt extends BaseFramework implements Framework {
  readonly id = 'nuxt'
  name = 'Nuxt'
  npmDependencies = ['nuxt', 'nuxt-edge', 'nuxt3']
  category = Category.SSG

  dev = {
    command: 'nuxt',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
    clearPublishDirectory: true,
  }

  build = {
    command: 'nuxt generate',
    directory: 'dist',
  }

  logo = {
    default: '/logos/nuxt/default.svg',
    light: '/logos/nuxt/light.svg',
    dark: '/logos/nuxt/dark.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      // Override with modern config for major version >= 3 or nuxt3 package
      if (
        this.detected.package?.name === 'nuxt3' ||
        (this.detected.package?.version?.major !== undefined && this.detected.package.version.major >= 3)
      ) {
        this.name = 'Nuxt 3'
        this.build.command = 'nuxt build'
        this.dev.command = 'nuxt dev'
      }
      return this as DetectedFramework
    }
  }
}
