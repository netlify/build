import { BaseFramework, Category, Framework } from './framework.js'

export class Vinxi extends BaseFramework implements Framework {
  readonly id = 'vinxi'
  name = 'Vinxi'
  npmDependencies = ['vinxi']
  category = Category.FrontendFramework

  dev = {
    command: 'vinxi dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'vinxi build',
    directory: 'dist',
  }

  env = {
    NITRO_PRESET: 'netlify',
  }
}
