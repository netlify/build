import { BaseFramework, Category, Framework } from './framework.js'

export class VuePress extends BaseFramework implements Framework {
  readonly id = 'vuepress'
  name = 'VuePress'
  npmDependencies = ['vuepress']
  category = Category.SSG

  dev = {
    command: 'vuepress dev',
    port: 8080,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'vuepress build',
    directory: '.vuepress/dist',
  }

  logo = {
    default: '/logos/vuepress/default.svg',
    light: '/logos/vuepress/default.svg',
    dark: '/logos/vuepress/default.svg',
  }
}
