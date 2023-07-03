import { BaseFramework, Category, Framework } from './framework.js'

export class Blitz extends BaseFramework implements Framework {
  readonly id = 'blitz'
  name = 'Blitz.js'
  npmDependencies = ['blitz']
  category = Category.SSG

  dev = {
    command: 'blitz dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'blitz build',
    directory: 'out',
  }

  logo = {
    default: '/logos/blitz/light.svg',
    light: '/logos/blitz/light.svg',
    dark: '/logos/blitz/dark.svg',
  }
}
