import { BaseFramework, Category, Framework } from './framework.js'

export class WMR extends BaseFramework implements Framework {
  readonly id = 'wmr'
  name = 'WMR'
  npmDependencies = ['wmr']
  category = Category.BuildTool

  dev = {
    command: 'wmr',
    port: 8080,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'wmr build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/wmr/default.svg',
    light: '/logos/wmr/default.svg',
    dark: '/logos/wmr/default.svg',
  }
}
