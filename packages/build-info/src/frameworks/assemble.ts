import { BaseFramework, Category, Framework } from './framework.js'

export class Assemble extends BaseFramework implements Framework {
  readonly id = 'assemble'
  name = 'Assemble'
  npmDependencies = ['assemble']
  category = Category.SSG

  build = {
    command: 'grunt build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/assemble/default.png',
    light: '/logos/assemble/default.png',
    dark: '/logos/assemble/default.png',
  }
}
