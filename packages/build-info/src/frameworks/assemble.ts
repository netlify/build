import { BaseFramework, Category, Framework } from './framework.js'

export class Assemble extends BaseFramework implements Framework {
  id = 'assemble'
  name = 'Assemble'
  npmDependencies = ['assemble']
  category = Category.SSG

  build = {
    command: 'grunt build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/assemble/default.svg',
    light: '/logos/assemble/default.svg',
    dark: '/logos/assemble/default.svg',
  }
}
