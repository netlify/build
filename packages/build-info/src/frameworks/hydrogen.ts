import { BaseFramework, Category, Framework } from './framework.js'

export class Hydrogen extends BaseFramework implements Framework {
  readonly id = 'hydrogen'
  name = 'Hydrogen'
  npmDependencies = ['@shopify/hydrogen']
  category = Category.SSG

  dev = {
    command: 'vite',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'npm run build',
    directory: 'dist/client',
  }

  logo = {
    default: '/logos/hydrogen/default.svg',
    light: '/logos/hydrogen/default.svg',
    dark: '/logos/hydrogen/default.svg',
  }
}
