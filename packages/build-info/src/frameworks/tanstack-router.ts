import { BaseFramework, Category, Framework } from './framework.js'

export class TanStackRouter extends BaseFramework implements Framework {
  readonly id = 'tanstack-router'
  name = 'TanStack Router'
  npmDependencies = ['@tanstack/react-router']
  excludedNpmDependencies = ['@tanstack/start', '@tanstack/react-start', '@tanstack/solid-start']
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
    default: '/logos/tanstack-router/default.png',
    light: '/logos/tanstack-router/default.png',
    dark: '/logos/tanstack-router/default.png',
  }
}
