import { BaseFramework, Category, Framework } from './framework.js'

export class Gridsome extends BaseFramework implements Framework {
  readonly id = 'gridsome'
  name = 'Gridsome'
  configFiles = ['gridsome.config.js']
  npmDependencies = ['gridsome']
  category = Category.SSG

  dev = {
    command: 'gridsome develop',
    port: 8080,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'gridsome build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/gridsome/default.svg',
    light: '/logos/gridsome/light.svg',
    dark: '/logos/gridsome/dark.svg',
  }
}
