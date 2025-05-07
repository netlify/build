import { BaseFramework, Category, Framework } from './framework.js'

export class Expo extends BaseFramework implements Framework {
  readonly id = 'expo'
  name = 'Expo'
  configFiles = ['app.json']
  npmDependencies = ['expo']
  category = Category.FrontendFramework

  dev = {
    command: 'expo start --web',
    port: 19006,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'expo export -p web',
    directory: 'dist',
  }

  logo = {
    default: '/logos/expo/default.svg',
    light: '/logos/expo/light.svg',
    dark: '/logos/expo/dark.svg',
  }
}
