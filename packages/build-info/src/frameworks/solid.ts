import { BaseFramework, Category, Framework } from './framework.js'

export class Solid extends BaseFramework implements Framework {
  readonly id = 'solid-js'
  name = 'SolidJS'
  npmDependencies = ['solid-js']
  excludedNpmDependencies = ['solid-start']
  category = Category.SSG

  dev = {
    command: 'npm run dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'npm run build',
    directory: 'netlify',
  }

  logo = {
    default: '/logos/solid-js/default.svg',
    light: '/logos/solid-js/default.svg',
    dark: '/logos/solid-js/dark.svg',
  }
}
