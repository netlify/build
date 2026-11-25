import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'
import { hasViteConfig } from './vite.js'

export class Nitro extends BaseFramework implements Framework {
  readonly id = 'nitro'
  name = 'Nitro'
  npmDependencies = ['nitro']
  excludedNpmDependencies = [
    // Frameworks built on Nitro
    'nuxt',
    'nuxt-edge',
    'nuxt3',
    'nuxt-nightly',
    'solid-start',
    '@solidjs/start',
    '@tanstack/start',
    '@tanstack/react-start',
    '@tanstack/solid-start',
    '@analogjs/platform',
  ]
  category = Category.BackendFramework

  dev = {
    command: 'nitro dev',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'nitro build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/nitro/default.svg',
    light: '/logos/nitro/default.svg',
    dark: '/logos/nitro/default.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      // With a Vite config, Nitro runs as a Vite plugin (`nitro/vite`), driven by `vite dev` and `vite build`
      const deps = {
        ...this.detected.packageJSON?.dependencies,
        ...this.detected.packageJSON?.devDependencies,
      }
      if ((deps.vite || deps['vite-plus']) && (await hasViteConfig(this))) {
        this.detected = undefined
        return
      }
      return this as DetectedFramework
    }
  }
}
