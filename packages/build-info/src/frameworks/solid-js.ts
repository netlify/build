import { BaseFramework, Category, Framework } from './framework.js'

export class SolidJs extends BaseFramework implements Framework {
  readonly id = 'solid-js'
  name = 'SolidJS'
  npmDependencies = ['solid-js']
  excludedNpmDependencies = ['solid-start', '@solidjs/start', '@tanstack/solid-start']
  category = Category.SSG

  dev = {
    command: 'vite dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vite build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/solid-js/default.svg',
    light: '/logos/solid-js/default.svg',
    dark: '/logos/solid-js/dark.svg',
  }
}
