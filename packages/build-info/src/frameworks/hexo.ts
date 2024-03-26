import { BaseFramework, Category, Framework } from './framework.js'

export class Hexo extends BaseFramework implements Framework {
  readonly id = 'hexo'
  name = 'Hexo'
  configFiles = ['_config.yml']
  npmDependencies = ['hexo']
  category = Category.SSG

  dev = {
    command: 'hexo server',
    port: 4000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'hexo generate',
    directory: 'public',
  }

  logo = {
    default: '/logos/hexo/default.svg',
    light: '/logos/hexo/light.svg',
    dark: '/logos/hexo/dark.svg',
  }
}
