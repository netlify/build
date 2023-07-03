import { BaseFramework, Category, Framework } from './framework.js'

export class Vue extends BaseFramework implements Framework {
  readonly id = 'vue'
  name = 'Vue.js'
  npmDependencies = ['@vue/cli-service']
  category = Category.FrontendFramework

  dev = {
    command: 'vue-cli-service serve',
    port: 8080,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'vue-cli-service build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/vue/default.svg',
    light: '/logos/vue/default.svg',
    dark: '/logos/vue/default.svg',
  }
}
