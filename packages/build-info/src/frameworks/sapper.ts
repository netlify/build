import { BaseFramework, Category, Framework } from './framework.js'

export class Sapper extends BaseFramework implements Framework {
  id = 'sapper'
  name = 'Sapper'
  npmDependencies = ['sapper']
  category = Category.FrontendFramework
  staticAssetsDirectory: 'static'

  dev = {
    command: 'sapper dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'sapper export',
    directory: '__sapper__/export',
  }

  logo = {
    default: '/logos/sapper/default.svg',
    light: '/logos/sapper/default.svg',
    dark: '/logos/sapper/default.svg',
  }
}
