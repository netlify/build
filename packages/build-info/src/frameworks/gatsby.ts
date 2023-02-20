import { gte } from 'semver'

import { BaseFramework, Category, Framework } from './framework.js'

export class Gatsby extends BaseFramework implements Framework {
  id = 'gatsby'
  name = 'Gatsby'
  configFiles = ['gatsby-config.js']
  npmDependencies = ['gatsby']
  category = Category.SSG
  staticAssetsDirectory = 'static'

  dev = {
    command: 'gatsby develop',
    port: 8000,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
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

  async detect()
  async detect(): Promise<this | undefined> {
    const detected = await super.detect()
    if (detected) {
      const nodeVersion = await this.project.getCurrentNodeVersion()
      if (nodeVersion && gte(nodeVersion, '12.13.0')) {
        this.plugins.push('@netlify/plugin-gatsby')
      }
      return this
    }
  }
}
