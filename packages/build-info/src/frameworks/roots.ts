import { BaseFramework, Category, Framework } from './framework.js'

export class Roots extends BaseFramework implements Framework {
  readonly id = 'roots'
  name = 'Roots'
  npmDependencies = ['roots']
  category = Category.SSG

  dev = {
    command: 'roots watch',
    port: 1111,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'roots compile',
    directory: 'public',
  }

  logo = {
    default: '/logos/roots/default.svg',
    light: '/logos/roots/default.svg',
    dark: '/logos/roots/default.svg',
  }
}
