import { BaseFramework, Category, Framework } from './framework.js'

export class Parcel extends BaseFramework implements Framework {
  readonly id = 'parcel'
  name = 'Parcel'
  npmDependencies = ['parcel-bundler', 'parcel']
  category = Category.BuildTool

  dev = {
    command: 'parcel',
    port: 1234,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'parcel build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/parcel/default.svg',
    light: '/logos/parcel/default.svg',
    dark: '/logos/parcel/default.svg',
  }
}
