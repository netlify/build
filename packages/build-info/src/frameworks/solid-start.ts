import { BaseFramework, Category, type DetectedFramework, type Framework } from './framework.js'

const LEGACY_PACKAGE_NAME = 'solid-start'
const LEGACY_DEV = {
  command: 'solid-start dev',
  port: 3000,
}
const LEGACY_BUILD = {
  command: 'solid-start build',
  directory: 'netlify',
}

export class SolidStart extends BaseFramework implements Framework {
  readonly id = 'solid-start'
  name = 'Solid Start'
  npmDependencies = [
    // Used this name up to 0.3.11
    'solid-start',
    // Renamed starting at 0.4.0
    '@solidjs/start',
  ]
  category = Category.SSG

  dev = {
    command: 'vinxi dev',
    port: 3000,
  }

  build = {
    command: 'vinxi build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/solid-start/default.svg',
    light: '/logos/solid-start/default.svg',
    dark: '/logos/solid-start/dark.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      if (this.detected.package?.name === LEGACY_PACKAGE_NAME) {
        this.dev = LEGACY_DEV
        this.build = LEGACY_BUILD
        return this as DetectedFramework
      }
      return this as DetectedFramework
    }
  }
}
