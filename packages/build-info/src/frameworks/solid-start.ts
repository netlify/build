import { BaseFramework, Category, Framework } from './framework.js'

export class SolidStart extends BaseFramework implements Framework {
  readonly id = 'solid-start'
  name = 'Solid Start'
  npmDependencies = ['@solidjs/start']
  category = Category.SSG

  dev = {
    command: 'vinxi dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vinxi build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/solid-start/default.svg',
    light: '/logos/solid-start/default.svg',
    dark: '/logos/solid-start/default.svg',
  }
}
