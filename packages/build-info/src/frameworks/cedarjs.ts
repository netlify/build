import { BaseFramework, Category, Framework } from './framework.js'

export class CedarJS extends BaseFramework implements Framework {
  readonly id = 'cedarjs'
  name = 'CedarJS'
  npmDependencies = ['@cedarjs/core']
  configFiles = ['cedar.toml']
  category = Category.SSG
  staticAssetsDirectory = 'public'

  dev = {
    // Cedar only works with yarn
    // https://cedarjs.com/docs/tutorial/chapter1/prerequisites#nodejs-and-yarn-versions
    command: 'yarn cedar dev',
    port: 8910,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    // explicitly not invoked with yarn: https://github.com/netlify/framework-info/commit/b3cd21d1e60d91facd397068f35b850b80d1ef13
    command: 'cedar deploy netlify',
    directory: 'web/dist',
  }

  env = {
    AWS_LAMBDA_JS_RUNTIME: 'nodejs24.x',
    NODE_VERSION: '24',
  }

  logo = {
    default: '/logos/cedarjs/default.png',
    light: '/logos/cedarjs/default.png',
    dark: '/logos/cedarjs/default.png',
  }
}
