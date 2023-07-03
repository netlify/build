import { BaseFramework, Category, Framework } from './framework.js'

export class SolidStart extends BaseFramework implements Framework {
  readonly id = 'solid-start'
  name = 'Solid Start'
  npmDependencies = ['solid-start']
  category = Category.SSG

  dev = {
    command: 'solid-start dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'solid-start build',
    directory: 'netlify',
  }

  logo = {
    default: '/logos/solid-start/default.svg',
    light: '/logos/solid-start/default.svg',
    dark: '/logos/solid-start/default.svg',
  }
}
