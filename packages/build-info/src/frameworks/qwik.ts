import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Qwik extends BaseFramework implements Framework {
  readonly id = 'qwik'
  name = 'Qwik'
  npmDependencies = ['@builder.io/qwik']
  category = Category.SSG

  dev = {
    command: 'vite',
    port: 5173,
    pollingStrategies: [{ name: 'TCP' }],
  }

  logo = {
    default: '/logos/qwik/default.svg',
    light: '/logos/qwik/default.svg',
    dark: '/logos/qwik/default.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      const allDeps = {
        ...(this.detected.packageJSON?.dependencies ?? {}),
        ...(this.detected.packageJSON?.devDependencies ?? {}),
      }
      if ('@builder.io/qwik-city' in allDeps) {
        this.category = Category.FullstackFramework
      }

      return this as DetectedFramework
    }
  }
}
