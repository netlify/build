import { BaseFramework, Category, Framework } from './framework.js'

export class Brunch extends BaseFramework implements Framework {
  readonly id = 'brunch'
  name = 'Brunch'
  npmDependencies = ['brunch']
  configFiles = ['brunch-config.js']
  category = Category.BuildTool

  dev = {
    command: 'brunch watch --server',
    port: 3333,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'brunch build',
    directory: 'public',
  }

  logo = {
    default: '/logos/brunch/default.svg',
    light: '/logos/brunch/default.svg',
    dark: '/logos/brunch/default.svg',
  }
}
