import { BaseFramework, Category, Framework, VerboseDetection } from './framework.js'

export class Quasar extends BaseFramework implements Framework {
  id = 'quasar'
  name = 'Quasar'
  npmDependencies = ['@quasar/app', 'quasar-cli']
  category = Category.FrontendFramework

  dev = {
    command: 'quasar dev -p 8081',
    port: 8081,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'quasar build',
    directory: 'dist/spa',
  }

  logo = {
    default: '/logos/quasar/default.svg',
    light: '/logos/quasar/default.svg',
    dark: '/logos/quasar/default.svg',
  }

  async detect()
  async detect(): Promise<this | undefined> {
    const detected = await super.detect(true)

    if (detected) {
      if (this.isV017(detected)) {
        this.id = 'quasar-v0.17'
        this.build.directory = '.quasar'
        this.dev.command = 'quasar dev -p 8080'
        this.dev.port = 8080
      }
      return this
    }
  }

  isV017(detected: VerboseDetection) {
    return detected.npmDependency?.name === 'quasar-cli'
  }
}
