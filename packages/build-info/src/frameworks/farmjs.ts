import { BaseFramework, Category, Framework } from './framework.js'

export class FarmJS extends BaseFramework implements Framework {
  readonly id = 'farmjs'
  name = 'Farm.js'
  // Only the package name: the unrelated Farm build tool (`@farmfe/core`) also uses `farm.config.ts`
  npmDependencies = ['@farm.js/core']
  category = Category.SSG

  dev = {
    command: 'farm dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'farm build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/farmjs/light.svg',
    light: '/logos/farmjs/light.svg',
    dark: '/logos/farmjs/dark.svg',
  }
}
