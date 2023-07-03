import { BaseFramework, Category, Framework } from './framework.js'

export class Angular extends BaseFramework implements Framework {
  readonly id = 'angular'
  name = 'Angular'
  configFiles = ['angular.json']
  npmDependencies = ['@angular/cli']
  category = Category.FrontendFramework

  dev = {
    port: 4200,
    command: 'ng serve',
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'ng build --prod',
    directory: 'dist/',
  }

  logo = {
    default: '/logos/angular/default.svg',
    light: '/logos/angular/default.svg',
    dark: '/logos/angular/default.svg',
  }
}
