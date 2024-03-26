import { BaseFramework, Category, Framework } from './framework.js'

export class Ember extends BaseFramework implements Framework {
  readonly id = 'ember'
  name = 'Ember.js'
  configFiles = ['ember-cli-build.js']
  npmDependencies = ['ember-cli']
  category = Category.FrontendFramework

  dev = {
    command: 'ember serve',
    port: 4200,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'ember build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/ember/default.svg',
    light: '/logos/ember/light.svg',
    dark: '/logos/ember/dark.svg',
  }
}
