import { BaseFramework, Category, Framework } from './framework.js'

export class DocPad extends BaseFramework implements Framework {
  readonly id = 'docpad'
  name = 'DocPad'
  npmDependencies = ['docpad']
  category = Category.SSG

  dev = {
    command: 'docpad run',
    port: 9778,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'docpad generate',
    directory: 'out',
  }
}
