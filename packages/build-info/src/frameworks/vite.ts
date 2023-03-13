import { BaseFramework, Category, Framework } from './framework.js'

export class Vite extends BaseFramework implements Framework {
  readonly id = 'vite'
  name = 'Vite'
  npmDependencies = ['vite']
  excludedNpmDependencies = ['@shopify/hydrogen', '@builder.io/qwik', 'solid-start', 'solid-js', '@sveltejs/kit']
  category = Category.BuildTool

  dev = {
    command: 'vite',
    port: 5173,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vite build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/vite/default.svg',
    light: '/logos/vite/default.svg',
    dark: '/logos/vite/default.svg',
  }
}
