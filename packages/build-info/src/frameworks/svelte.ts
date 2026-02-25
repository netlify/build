import { BaseFramework, Category, Framework } from './framework.js'

export class Svelte extends BaseFramework implements Framework {
  readonly id = 'svelte'
  name = 'Svelte'
  npmDependencies = ['svelte']
  excludedNpmDependencies = ['sapper', '@sveltejs/kit']
  configFiles = ['svelte.config.js']
  category = Category.FrontendFramework
  staticAssetsDirectory = 'static'

  dev = {
    command: 'npm run dev',
    port: 5000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'npm run build',
    directory: 'public',
  }

  logo = {
    default: '/logos/svelte-kit/default.svg',
    light: '/logos/svelte-kit/default.svg',
    dark: '/logos/svelte-kit/default.svg',
  }
}
