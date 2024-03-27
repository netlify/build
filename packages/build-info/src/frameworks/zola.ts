import { BaseFramework, Category, Framework } from './framework.js'

export class Zola extends BaseFramework implements Framework {
  readonly id = 'zola'
  name = 'Zola'
  configFiles = ['config.toml']
  category = Category.SSG

  dev = {
    command: 'zola serve',
    port: 1111,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'zola build',
    directory: 'public',
  }
}
