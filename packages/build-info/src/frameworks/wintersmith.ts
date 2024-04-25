import { BaseFramework, Category, Framework } from './framework.js'

export class Wintersmith extends BaseFramework implements Framework {
  readonly id = 'wintersmith'
  name = 'Wintersmith'
  npmDependencies = ['wintersmith']
  configFiles = ['config.json']
  category = Category.SSG

  dev = {
    command: 'wintersmith preview',
    port: 8080,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'wintersmith build',
    directory: 'build',
  }

  logo = {
    default: '/logos/wintersmith/default.svg',
    light: '/logos/wintersmith/default.svg',
    dark: '/logos/wintersmith/default.svg',
  }
}
