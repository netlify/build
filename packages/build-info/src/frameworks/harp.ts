import { BaseFramework, Category, Framework } from './framework.js'

export class Harp extends BaseFramework implements Framework {
  readonly id = 'harp'
  name = 'Harp'
  npmDependencies = ['harp']
  category = Category.SSG

  dev = {
    command: 'harp server',
    port: 9000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'harp compile',
    directory: 'www',
  }

  logo = {
    default: '/logos/harp/default.svg',
    light: '/logos/harp/light.svg',
    dark: '/logos/harp/default.svg',
  }
}
