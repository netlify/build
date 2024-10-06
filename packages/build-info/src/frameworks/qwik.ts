import { BaseFramework, Category, Framework } from './framework.js'

export class Qwik extends BaseFramework implements Framework {
  readonly id = 'qwik'
  name = 'Qwik'
  npmDependencies = ['@builder.io/qwik']
  category = Category.SSG

  dev = {
    command: 'vite dev',
    port: 5173,
    pollingStrategies: [{ name: 'TCP' }],
  }

  logo = {
    default: '/logos/qwik/default.svg',
    light: '/logos/qwik/default.svg',
    dark: '/logos/qwik/default.svg',
  }
}
