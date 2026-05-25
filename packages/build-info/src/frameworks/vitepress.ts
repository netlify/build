import { BaseFramework, Category, Framework } from './framework.js'

export class VitePress extends BaseFramework implements Framework {
  readonly id = 'vitepress'
  name = 'VitePress'
  npmDependencies = ['vitepress']
  category = Category.SSG

  dev = {
    command: 'vitepress dev docs',
    port: 5173,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vitepress build docs',
    directory: 'docs/.vitepress/dist',
  }

  logo = {
    default: '/logos/vitepress/default.svg',
    light: '/logos/vitepress/default.svg',
    dark: '/logos/vitepress/default.svg',
  }
}
