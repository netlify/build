import { BaseFramework, Category, Framework } from './framework.js'

export class Grunt extends BaseFramework implements Framework {
  readonly id = 'grunt'
  name = 'Grunt'
  npmDependencies = ['grunt']
  category = Category.BuildTool

  build = {
    command: 'grunt build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/grunt/default.svg',
    light: '/logos/grunt/default.svg',
    dark: '/logos/grunt/default.svg',
  }
}
