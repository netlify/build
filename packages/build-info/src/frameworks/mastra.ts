import { BaseFramework, Category, Framework } from './framework.js'

export class Mastra extends BaseFramework implements Framework {
  readonly id = 'mastra'
  name = 'Mastra'
  npmDependencies = ['@mastra/deployer-netlify']
  category = Category.BackendFramework

  dev = {
    command: 'mastra dev',
    port: 4111,
  }

  build = {
    command: 'mastra build',
    directory: 'dist', // not used, set to default
  }

  logo = {
    default: '/logos/mastra/light.svg',
    light: '/logos/mastra/light.svg',
    dark: '/logos/mastra/dark.svg',
  }
}
