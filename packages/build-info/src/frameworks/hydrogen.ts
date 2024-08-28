import { Accuracy, BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

const CLASSIC_COMPILER_CONFIG_FILES = ['remix.config.js']
const CLASSIC_COMPILER_DEV = {
  command: 'remix dev --manual -c "netlify dev"',
}
const CLASSIC_COMPILER_BUILD = {
  command: 'remix build',
  directory: 'public',
}

const VITE_CONFIG_FILES = [
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.cjs',
  'vite.config.ts',
  'vite.config.mts',
  'vite.config.cts',
]
const VITE_DEV = {
  command: 'shopify hydrogen dev',
  port: 5173,
}
const VITE_BUILD = {
  command: 'remix vite:build',
  directory: 'dist/client',
}

export class Hydrogen extends BaseFramework implements Framework {
  readonly id = 'hydrogen'
  name = 'Hydrogen'
  npmDependencies = ['@shopify/hydrogen']
  category = Category.SSG

  logo = {
    default: '/logos/hydrogen/default.svg',
    light: '/logos/hydrogen/default.svg',
    dark: '/logos/hydrogen/default.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      const viteDetection = await this.detectConfigFile(VITE_CONFIG_FILES)
      if (viteDetection) {
        // This site will otherwise get detected as both Remix (Vite) and Hydrogen (Vite). There is no other mechanism
        // we can use to prioritize Hydrogen. TODO(serhalp) Add more fine-grained levels to `Accuracy`, such as
        // `Framework`, `MetaFramework`, and `MetaMetaFramework`?
        this.detected = { ...viteDetection, accuracy: Accuracy.Forced }
        this.dev = VITE_DEV
        this.build = VITE_BUILD
        return this as DetectedFramework
      }
      const classicCompilerDetection = await this.detectConfigFile(CLASSIC_COMPILER_CONFIG_FILES)
      if (classicCompilerDetection) {
        // See comment above.
        this.detected = { ...classicCompilerDetection, accuracy: Accuracy.Forced }
        this.dev = CLASSIC_COMPILER_DEV
        this.build = CLASSIC_COMPILER_BUILD
        return this as DetectedFramework
      }
      // If neither config file exists, it can't be a valid Hydrogen site for Netlify anyway.
      return
    }
  }
}
