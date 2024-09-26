import { BaseFramework, Category, Framework } from './framework.js'

export class TanStackRouter extends BaseFramework implements Framework {
  readonly id = 'tanstack-router'
  name = 'TanStack Router'
  npmDependencies = ['@tanstack/react-router']
  excludedNpmDependencies = ['@tanstack/start']
  category = Category.SSG

  dev = {
    command: 'vite',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vite build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/tanstack-router/default.svg',
    light: '/logos/tanstack-router/default.svg',
    dark: '/logos/tanstack-router/dark.svg',
  }
}
