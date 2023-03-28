import { BaseFramework, Category, Framework } from './framework.js'

export class Stencil extends BaseFramework implements Framework {
  readonly id = 'stencil'
  name = 'SolidJS'
  npmDependencies = ['@stencil/core']
  configFiles = ['stencil.config.ts']
  category = Category.SSG

  dev = {
    command: 'stencil build --dev --watch --serve',
    port: 3333,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'stencil build',
    directory: 'www',
  }

  logo = {
    default: '/logos/stencil/light.svg',
    light: '/logos/stencil/light.svg',
    dark: '/logos/stencil/dark.svg',
  }

  env = {
    BROWSER: 'none',
    PORT: '3000',
  }
}
