import { BaseFramework, Category, Framework, VerboseDetection } from './framework.js'

export class Nuxt extends BaseFramework implements Framework {
  id = 'nuxt'
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

  async detect()
  async detect(): Promise<this | undefined> {
    const detected = await super.detect(true)

    if (detected) {
      if (this.isV3(detected)) {
        this.name = 'Nuxt 3'

        const cmd = this.project.packageManager?.runCommand || 'npm run'
        this.build.command = `${cmd} build`
        this.dev.command = `${cmd} dev`

        this.env = {
          AWS_LAMBDA_JS_RUNTIME: 'nodejs14.x',
          NODE_VERSION: '14',
        }
      }
      return this
    }
  }

  isV3(detected: VerboseDetection) {
    return detected.npmDependency?.name === 'nuxt3' || detected.npmDependency?.version?.major === 3
  }
}
