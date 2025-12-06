import { BaseFramework, Category, Framework } from './framework.js'

export class Vike extends BaseFramework implements Framework {
  readonly id = 'vike'
  name = 'Vike'
  npmDependencies = ['vike']
  category = Category.SSG

  dev = {
    command: 'vike dev',
    port: 3000,
  }

  build = {
    command: 'vike build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/vike/light.svg',
    light: '/logos/vite/light.svg',
    dark: '/logos/vite/dark.svg',
  }
}
