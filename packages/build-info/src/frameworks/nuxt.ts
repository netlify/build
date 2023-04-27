import { BaseFramework, Category, DetectedFramework, Detection, Framework } from './framework.js'

export class Nuxt extends BaseFramework implements Framework {
  readonly id = 'nuxt'
  name = 'Nuxt'
  npmDependencies = ['nuxt', 'nuxt-edge', 'nuxt3']
  category = Category.SSG

  dev = {
    command: 'nuxt',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }, { name: 'HTTP' }],
  }

  build = {
    command: 'nuxt generate',
    directory: 'dist',
  }

  logo = {
    default: '/logos/nuxt/default.svg',
    light: '/logos/nuxt/light.svg',
    dark: '/logos/nuxt/dark.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      if (this.isV3(this.detected)) {
        this.name = 'Nuxt 3'

        this.build.command = `nuxt build`
        this.build.directory = `.nuxt/dist`
        this.dev.command = `nuxt dev`

        this.env = {
          AWS_LAMBDA_JS_RUNTIME: 'nodejs18.x',
          NODE_VERSION: '18',
        }
      }
      return this as DetectedFramework
    }
  }

  isV3(detected: Detection) {
    return detected.package?.name === 'nuxt3' || detected.package?.version?.major === 3
  }
}
