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

        const cmd = this.project.packageManager?.runCommand || 'npm run'
        this.build.command = `${cmd} build`
        this.dev.command = `${cmd} dev`

        this.env = {
          AWS_LAMBDA_JS_RUNTIME: 'nodejs14.x',
          NODE_VERSION: '14',
        }
      }
      return this as DetectedFramework
    }
  }

  isV3(detected: Detection) {
    return detected.package?.name === 'nuxt3' || detected.package?.version?.major === 3
  }
}
