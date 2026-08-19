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
    command: 'vite dev',
    port: 5173,
  }

  build = {
    command: 'vite build',
    directory: 'dist/client',
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

      // Became "just vite" starting in v2, used vinxi 0.4.0 to 1.x.
      if (this.version && this.version.major < 2) {
        this.dev.command = 'vinxi dev'
        this.dev.port = 3000
        this.build.command = 'vinxi build'
        this.build.directory = 'dist'
      }

      return this as DetectedFramework
    }
  }
}
