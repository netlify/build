import { BaseFramework, Category, Framework } from './framework.js'

export class Cecil extends BaseFramework implements Framework {
  readonly id = 'cecil'
  name = 'Cecil'
  configFiles = ['config.yml']
  category = Category.SSG

  dev = {
    command: 'cecil serve',
    port: 8000,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'cecil build',
    directory: '_site',
  }

  logo = {
    default: '/logos/cecil/default.svg',
    light: '/logos/cecil/default.svg',
    dark: '/logos/cecil/default.svg',
  }
}
