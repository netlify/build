import { BaseFramework, Category, Framework } from './framework.js'

export class Analog extends BaseFramework implements Framework {
  readonly id = 'analog'
  name = 'Analog'
  configFiles = []
  npmDependencies = ['@analogjs/platform']
  category = Category.SSG

  dev = {
    port: 5173,
    command: 'ng serve',
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'ng build --prod',
    directory: 'dist/analog/public',
  }

  logo = {
    default: '/logos/analog/default.svg',
    light: '/logos/analog/default.svg',
    dark: '/logos/analog/default.svg',
  }
}
