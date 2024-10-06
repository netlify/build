import { BaseFramework, Category, Framework } from './framework.js'

export class Hugo extends BaseFramework implements Framework {
  readonly id = 'hugo'
  name = 'Hugo'
  configFiles = ['config.json', 'config.toml', 'config.yaml', 'hugo.toml']
  category = Category.SSG

  dev = {
    command: 'hugo server -w',
    port: 1313,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    // XXX verify if true
    command: 'hugo build',
    directory: 'public',
  }

  logo = {
    default: '/logos/hugo/default.svg',
    light: '/logos/hugo/default.svg',
    dark: '/logos/hugo/default.svg',
  }
}
