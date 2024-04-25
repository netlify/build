import { BaseFramework, Category, Framework } from './framework.js'

export class Jekyll extends BaseFramework implements Framework {
  readonly id = 'jekyll'
  name = 'Jekyll'
  configFiles = ['_config.yml', '_config.yaml', '_config.toml']
  category = Category.SSG

  dev = {
    command: 'bundle exec jekyll serve -w',
    port: 4000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'bundle exec jekyll build',
    directory: '_site',
  }

  logo = {
    default: '/logos/jekyll/dark.svg',
    light: '/logos/jekyll/light.svg',
    dark: '/logos/jekyll/dark.svg',
  }
}
