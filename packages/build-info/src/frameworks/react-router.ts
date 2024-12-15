import { lt } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class ReactRouter extends BaseFramework implements Framework {
  readonly id = 'react-router'
  name = 'React Router'
  // React Router 7+ can be used either as a library or as a framework. We want to ignore lib mode (and possibly let
  // other frameworks/bundlers/runners be detected). There isn't a perfect way to identify a site's mode, but at the
  // time of writing both `@react-router/dev` and `react-router.config` should only be present in framework mode.
  npmDependencies = ['@react-router/dev']
  configFiles = ['react-router.config.ts', 'react-router.config.js']
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
