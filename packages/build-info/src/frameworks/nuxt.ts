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
      // Use Nuxt 3+ config as default, only apply legacy config for versions < 3
      if (this.detected.package?.name === 'nuxt3' || (this.detected.package?.version?.major !== undefined && this.detected.package.version.major >= 3)) {
        // Nuxt 3+ config (including v4 and future versions)
        this.name = 'Nuxt 3'
        this.build.command = `nuxt build`
        this.build.directory = `dist`
        this.dev.command = `nuxt dev`
      }
      // Legacy Nuxt < 3 config uses the default config already set in the class
      return this as DetectedFramework
    }
  }
}
