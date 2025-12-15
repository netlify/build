import { BaseFramework, Category, Framework } from './framework.js'

export class Waku extends BaseFramework implements Framework {
  readonly id = 'waku'
  name = 'Waku'
  npmDependencies = ['waku']
  configFiles = ['waku.config.ts', 'waku.config.js']
  category = Category.SSG

  dev = {
    command: 'waku dev',
    port: 3000,
  }

  build = {
    command: 'waku build',
    directory: 'dist/public',
  }

  logo = {
    default: '/logos/waku/light.svg',
    light: '/logos/waku/light.svg',
    dark: '/logos/waku/dark.svg',
  }
}
