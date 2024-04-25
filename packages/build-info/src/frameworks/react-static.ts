import { BaseFramework, Category, Framework } from './framework.js'

export class ReactStatic extends BaseFramework implements Framework {
  readonly id = 'react-static'
  name = 'React Static'
  npmDependencies = ['react-static']
  configFiles = ['static.config.js']
  category = Category.SSG

  dev = {
    command: 'react-static start',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'react-static build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/react-static/default.png',
    light: '/logos/react-static/default.png',
    dark: '/logos/react-static/default.png',
  }
}
