import { BaseFramework, Category, Framework } from './framework.js'

export class Gulp extends BaseFramework implements Framework {
  readonly id = 'gulp'
  name = 'gulp.js'
  npmDependencies = ['gulp']
  category = Category.BuildTool

  build = {
    command: 'gulp build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/gulp/default.svg',
    light: '/logos/gulp/default.svg',
    dark: '/logos/gulp/default.svg',
  }
}
