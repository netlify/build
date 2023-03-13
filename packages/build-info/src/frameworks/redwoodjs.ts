import { BaseFramework, Category, Framework } from './framework.js'

export class RedwoodJS extends BaseFramework implements Framework {
  readonly id = 'redwoodjs'
  name = 'RedwoodJS'
  npmDependencies = ['@redwoodjs/core']
  configFiles = ['redwood.toml']
  category = Category.SSG
  staticAssetsDirectory = 'public'

  dev = {
    // redwood only works with yarn
    // https://redwoodjs.com/docs/tutorial/chapter1/prerequisites#nodejs-and-yarn-versions
    command: 'yarn rw dev',
    port: 8910,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    // explicitly not invoked with yarn: https://github.com/netlify/framework-info/commit/b3cd21d1e60d91facd397068f35b850b80d1ef13
    command: 'rw deploy netlify',
    directory: 'web/dist',
  }

  logo = {
    default: '/logos/redwoodjs/default.svg',
    light: '/logos/redwoodjs/default.svg',
    dark: '/logos/redwoodjs/default.svg',
  }
}
