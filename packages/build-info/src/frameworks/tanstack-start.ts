import { BaseFramework, Category, Framework } from './framework.js'

export class TanStackStart extends BaseFramework implements Framework {
  readonly id = 'tanstack-start'
  name = 'TanStack Start'
  npmDependencies = ['@tanstack/start']
  category = Category.SSG

  dev = {
    command: 'vinxi dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vinxi build',
    directory: 'dist',
  }
}
