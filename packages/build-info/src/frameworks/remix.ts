import { BaseFramework, Category, Framework } from './framework.js'

export class Remix extends BaseFramework implements Framework {
  readonly id = 'remix'
  name = 'Remix'
  npmDependencies = ['remix', '@remix-run/netlify', '@remix-run/netlify-edge']
  configFiles = ['remix.config.js']
  category = Category.SSG

  dev = {
    command: 'remix watch',
  }

  build = {
    command: 'remix build',
    directory: 'public',
  }

  logo = {
    default: '/logos/remix/default.svg',
    light: '/logos/remix/light.svg',
    dark: '/logos/remix/dark.svg',
  }
}
