import { BaseFramework, Category, DetectedFramework, Framework } from './framework.js'

export class Vite extends BaseFramework implements Framework {
  readonly id = 'vite'
  name = 'Vite'
  npmDependencies = ['vite', 'vite-plus']
  excludedNpmDependencies = [
    '@remix-run/react',
    '@remix-run/dev',
    '@remix-run/server-runtime',
    '@shopify/hydrogen',
    '@builder.io/qwik',
    // Used this name up to 0.3.11
    'solid-start',
    // Renamed starting at 0.4.0
    '@solidjs/start',
    'solid-js',
    '@tanstack/react-router',
    '@tanstack/start',
    '@sveltejs/kit',
    '@analogjs/platform',
    '@react-router/dev',
    'vike',
  ]
  category = Category.BuildTool

  dev = {
    command: 'vite',
    port: 5173,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'vite build',
    directory: 'dist',
  }

  logo = {
    default: '/logos/vite/default.svg',
    light: '/logos/vite/default.svg',
    dark: '/logos/vite/default.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    const detected = await super.detect()

    // Vite Plus projects drive Vite through the vp CLI (`vp migrate` may even remove
    // the direct vite dependency), so prefer its command surface when present
    const deps = {
      ...this.detected?.packageJSON?.dependencies,
      ...this.detected?.packageJSON?.devDependencies,
    }
    if (detected && deps['vite-plus']) {
      this.dev.command = 'vp dev'
      this.build.command = 'vp build'
    }

    return detected
  }
}
