import { BaseFramework, Category, Framework } from './framework.js'

export class Eleventy extends BaseFramework implements Framework {
  readonly id = 'eleventy'
  name = 'Eleventy'
  configFiles = ['.eleventy.js', 'eleventy.config.js', 'eleventy.config.cjs']
  npmDependencies = ['@11ty/eleventy']
  category = Category.SSG

  dev = {
    command: 'eleventy --serve',
    port: 8080,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'eleventy',
    directory: '_site',
  }

  logo = {
    default: '/logos/eleventy/default.svg',
    light: '/logos/eleventy/light.svg',
    dark: '/logos/eleventy/dark.svg',
  }
}
