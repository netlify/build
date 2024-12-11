import { lt } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class ReactRouter extends BaseFramework implements Framework {
  readonly id = 'react-router'
  name = 'React Router'
  configFiles = ['react-router.config.ts', 'react-router.config.js']
  npmDependencies = ['react-router']
  category = Category.SSG

  dev = {
    port: 5173,
    command: 'react-router dev',
  }

  build = {
    command: 'react-router build',
    directory: 'build/client',
  }

  logo = {
    default: '/logos/react-router/light.svg',
    light: '/logos/react-router/light.svg',
    dark: '/logos/react-router/dark.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      // React Router wasn't a framework before v7. As of v7, it's... Remix.
      if (this.version && lt(this.version, '7.0.0')) {
        return
      }

      return this as DetectedFramework
    }
  }
}
