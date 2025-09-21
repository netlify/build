import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Nuxt extends BaseFramework implements Framework {
  readonly id = 'nuxt'
  name = 'Nuxt 3'
  npmDependencies = ['nuxt', 'nuxt-edge', 'nuxt3']
  category = Category.SSG

  dev = {
    command: 'nuxt dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
    clearPublishDirectory: true,
  }

  build = {
    command: 'nuxt build',
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
      // Only use modern config for nuxt3 package or nuxt/nuxt-edge with explicit version >= 3
      // Default to legacy for nuxt/nuxt-edge without version info
      if (
        this.detected.package?.name === 'nuxt3' ||
        (this.detected.package?.version?.major !== undefined && this.detected.package.version.major >= 3)
      ) {
        // Modern Nuxt 3+ config is already set as default
      } else {
        // Legacy Nuxt < 3 config for nuxt/nuxt-edge without version or with version < 3
        this.name = 'Nuxt'
        this.build.command = 'nuxt generate'
        this.dev.command = 'nuxt'
      }
      return this as DetectedFramework
    }
  }
}
