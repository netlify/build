import { lt } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class TanStackStart extends BaseFramework implements Framework {
  readonly id = 'tanstack-start'
  name = 'TanStack Start'
  npmDependencies = [
    // This was the package name until it became `@tanstack/react-start` in v1.111.0
    '@tanstack/start',
    '@tanstack/react-start',
    '@tanstack/solid-start',
  ]
  category = Category.SSG

  dev = {
    command: 'vite dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vite build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/tanstack-start/default.png',
    light: '/logos/tanstack-start/default.png',
    dark: '/logos/tanstack-start/default.png',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      // TanStack Start used vinxi before v1.121.0
      if (this.version && lt(this.version, '1.121.0')) {
        this.dev.command = 'vinxi dev'
        this.build.command = 'vinxi build'
      }
      return this as DetectedFramework
    }
  }
}
