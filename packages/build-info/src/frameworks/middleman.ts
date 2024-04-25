import { BaseFramework, Category, Framework } from './framework.js'

export class Middleman extends BaseFramework implements Framework {
  readonly id = 'middleman'
  name = 'Middleman'
  configFiles = ['config.rb']
  category = Category.SSG

  dev = {
    command: 'bundle exec middleman server',
    port: 4567,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'bundle exec middleman build',
    directory: 'build',
  }

  logo = {
    default: '/logos/middleman/default.svg',
    light: '/logos/middleman/default.svg',
    dark: '/logos/middleman/default.svg',
  }
}
