import { gte } from 'semver'

import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Gatsby extends BaseFramework implements Framework {
  readonly id = 'gatsby'
  name = 'Gatsby'
  configFiles = ['gatsby-config.js', 'gatsby-config.ts']
  npmDependencies = ['gatsby']
  category = Category.SSG
  staticAssetsDirectory = 'static'

  dev = {
    command: 'gatsby develop',
    port: 8000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'gatsby build',
    directory: 'public',
  }

  logo = {
    default: '/logos/gatsby/default.svg',
    light: '/logos/gatsby/light.svg',
    dark: '/logos/gatsby/dark.svg',
  }

  env = {
    GATSBY_LOGGER: 'yurnalist',
    GATSBY_PRECOMPILE_DEVELOP_FUNCTIONS: 'true',
    AWS_LAMBDA_JS_RUNTIME: 'nodejs14.x',
    NODE_VERSION: '14',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      if (this.version && gte(this.version, '5.0.0')) {
        this.env.NODE_VERSION = '18'
        this.env.AWS_LAMBDA_JS_RUNTIME = 'nodejs18.x'
      }

      const nodeVersion = await this.project.getCurrentNodeVersion()
      if (nodeVersion && gte(nodeVersion, '12.13.0') && !process.env.NETLIFY_SKIP_GATSBY_BUILD_PLUGIN) {
        this.plugins.push('@netlify/plugin-gatsby')
      }
      return this as DetectedFramework
    }
  }
}
