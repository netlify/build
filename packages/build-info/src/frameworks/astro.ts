import { BaseFramework, Category, Framework } from './framework.js'

export class Astro extends BaseFramework implements Framework {
  readonly id = 'astro'
  name = 'Astro'
  configFiles = ['astro.config.mjs']
  npmDependencies = ['astro']
  category = Category.SSG
  staticAssetsDirectory = 'public'

  dev = {
    port: 3000,
    command: 'astro dev',
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'astro build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/astro/light.svg',
    light: '/logos/astro/light.svg',
    dark: '/logos/astro/dark.svg',
  }
}
