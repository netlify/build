import { BaseFramework, Category, Framework } from './framework.js'

export class Metalsmith extends BaseFramework implements Framework {
  readonly id = 'metalsmith'
  name = 'Metalsmith'
  npmDependencies = ['metalsmith']
  category = Category.SSG

  build = {
    command: 'metalsmith',
    directory: 'build',
  }

  logo = {
    default: '/logos/metalsmith/default.svg',
    light: '/logos/metalsmith/default.svg',
    dark: '/logos/metalsmith/default.svg',
  }
}
