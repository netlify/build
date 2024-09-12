import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

const CLASSIC_COMPILER_CONFIG_FILES = ['remix.config.js']
const CLASSIC_COMPILER_DEV = {
  command: 'remix watch',
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
  command: 'remix vite:dev',
  port: 5173,
}
const VITE_BUILD = {
  command: 'remix vite:build',
  directory: 'build/client',
}

export class Remix extends BaseFramework implements Framework {
  readonly id = 'remix'
  name = 'Remix'
  npmDependencies = [
    '@remix-run/react',
    '@remix-run/dev',
    '@remix-run/server-runtime',
    '@netlify/remix-adapter',
    '@netlify/remix-edge-adapter',
    '@netlify/remix-runtime',
    // Deprecated package name (deprecated in 1.6, removed in 2.0)
    'remix',
    // Deprecated Netlify packages
    '@remix-run/netlify',
    '@remix-run/netlify-edge',
  ]
  excludedNpmDependencies = ['@shopify/hydrogen']
  category = Category.SSG

  logo = {
    default: '/logos/remix/default.svg',
    light: '/logos/remix/light.svg',
    dark: '/logos/remix/dark.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    if (this.detected) {
      const viteDetection = await this.detectConfigFile(VITE_CONFIG_FILES)
      if (viteDetection) {
        this.detected = viteDetection
        this.dev = VITE_DEV
        this.build = VITE_BUILD
        return this as DetectedFramework
      }
      const classicCompilerDetection = await this.detectConfigFile(CLASSIC_COMPILER_CONFIG_FILES)
      if (classicCompilerDetection) {
        this.detected = classicCompilerDetection
        this.dev = CLASSIC_COMPILER_DEV
        this.build = CLASSIC_COMPILER_BUILD
        return this as DetectedFramework
      }
      // If neither config file exists, it can't be a valid Remix site for Netlify anyway.
      return
    }
  }
}
