import { BaseFramework, Category, Framework } from './framework.js'

export class Observable extends BaseFramework implements Framework {
  readonly id = 'observable'
  name = 'Observable Framework'
  npmDependencies = ['@observablehq/framework']
  category = Category.SSG

  dev = {
    command: 'observable preview',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'observable build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/observable/default.svg',
    light: '/logos/observable/default.svg',
    dark: '/logos/observable/default.svg',
  }
}
