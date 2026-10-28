import { BaseFramework, Category, DetectedFramework, Framework, mergeDetections } from './framework.js'

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
  // This should be `shopify hydrogen build` but we use this as a workaround for
  // https://github.com/Shopify/hydrogen/issues/2496 and https://github.com/Shopify/hydrogen/issues/2497.
  command: 'remix vite:build',
  directory: 'dist/client',
}

export class Hydrogen extends BaseFramework implements Framework {
  readonly id = 'hydrogen'
  name = 'Hydrogen'
  npmDependencies = ['@shopify/hydrogen']
  // Vite config files are deliberately not detection signals: they're too generic and led to
  // false positives (any repo with a vite.config.* was detected as Hydrogen). They're only used
  // below to pick the Vite vs Classic Compiler commands once Hydrogen is actually detected.
  configFiles = CLASSIC_COMPILER_CONFIG_FILES
  category = Category.SSG

  logo = {
    default: '/logos/hydrogen/default.svg',
    light: '/logos/hydrogen/default.svg',
    dark: '/logos/hydrogen/default.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      // A classic compiler config takes precedence over a vite config (e.g. mid-migration repos)
      if (this.detected.configName == null || !CLASSIC_COMPILER_CONFIG_FILES.includes(this.detected.configName)) {
        const viteDetection = await this.detectConfigFile(VITE_CONFIG_FILES)
        if (viteDetection) {
          this.detected = mergeDetections([this.detected, viteDetection])
          this.dev = VITE_DEV
          this.build = VITE_BUILD
          return this as DetectedFramework
        }
      }

      this.dev = CLASSIC_COMPILER_DEV
      this.build = CLASSIC_COMPILER_BUILD
      return this as DetectedFramework
    }
  }
}
